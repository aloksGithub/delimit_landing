import styles from "./PerpetualGraph.module.css";
import Link from "next/link";
import {useEffect, useState, useRef, useLayoutEffect, useCallback} from "react";
import * as THREE from "three";
import {Canvas, useFrame, useThree} from "@react-three/fiber";
import {Vector3} from "three";
import { Image, OrbitControls, PerspectiveCamera, Text, Text3D } from "@react-three/drei";
import UsePrice from "./UsePrice";
import { Scrollbars } from 'react-custom-scrollbars';

type LineProps = {
  start: number[];
  end: number[];
};

function Line(props: LineProps) {
  const ref = useRef<THREE.Line>(null);

  useFrame(() => {
    if (ref.current) {
      ref.current.geometry.setFromPoints(
        [props.start, props.end].map((point) => new THREE.Vector3(...point))
      );
    }
  });
  return (
    <line ref={ref}>
      <bufferGeometry />
      <lineBasicMaterial color="#1A202C" />
    </line>
  );
}

function Plane({
  width,
  height,
  size,
}: {
  width: number;
  height: number;
  size: number;
}) {
  return (
    <mesh receiveShadow={true}>
      {Array.from(Array(width + 1).keys()).map((w) => {
        return w % size === 0 ? (
          <Line start={[w, 0, 0]} end={[w, height, 0]} />
        ) : (
          <></>
        );
      })}
      {Array.from(Array(height + 1).keys()).map((h) => {
        return h % size === 0 ? (
          <Line start={[0, h, 0]} end={[width, h, 0]} />
        ) : (
          <></>
        );
      })}
    </mesh>
  );
}

function generateRandomNumbers(size: number, min: number, max: number) {
  let randomNumbers = [];
  for (let i = 0; i < size; i++) {
    randomNumbers.push(Math.random() * (max - min) + min);
  }
  return randomNumbers;
}

const LineGraph = ({
  tokenData,
  ySize,
  xSize,
  granularity,
}: {
  tokenData: {name: string, symbol: string, logo: string};
  ySize: number;
  xSize: number;
  granularity: number;
}) => {
  console.log(tokenData.symbol)
  const {data, loading, error} = UsePrice(tokenData.name)
  if (!data) return <></>

  const pointsNeeded = Math.floor(xSize / granularity);

  const priceSpacing = Math.floor(data.prices.length / pointsNeeded);
  const selectedPrices = data.prices
    .filter((price, index) => {
      return index % priceSpacing == 0;
    })
    .slice(-pointsNeeded);

  const points = [];
  const maxPrice = selectedPrices.reduce(
    (prev, curr) => (curr > prev ? curr : prev),
    0
  );
  // points.push(new Vector3(1, 1, 0))
  for (const [index, price] of selectedPrices.entries()) {
    points.push(
      new THREE.Vector3(granularity * index, (ySize * price) / maxPrice, 0)
    );
  }
  const lowestElevation = points.reduce((prev, curr)=>curr.y<prev?curr.y:prev, ySize)
  const maxWidth = points[points.length-1]?.x || 0
  // points.push(new Vector3(xSize, 0, 0))
  // points.push(new Vector3(1, 1, 0))
  const geometry = new THREE.BufferGeometry()
  const vertices: number[] = []
  for (const [index, point] of points.entries()) {
    if (index===points.length-1) continue
    vertices.push(point.x);vertices.push(point.y);vertices.push(point.z);
    vertices.push(point.x);vertices.push(lowestElevation);vertices.push(point.z);
    vertices.push(points[index+1].x);vertices.push(lowestElevation);vertices.push(points[index+1].z);

    vertices.push(points[index+1].x);vertices.push(lowestElevation);vertices.push(points[index+1].z);
    vertices.push(points[index+1].x);vertices.push(points[index+1].y);vertices.push(points[index+1].z);
    vertices.push(point.x);vertices.push(point.y);vertices.push(point.z);

    vertices.push(point.x);vertices.push(point.y);vertices.push(point.z);
    vertices.push(point.x);vertices.push(lowestElevation);vertices.push(point.z);
    vertices.push(points[index+1].x);vertices.push(points[index+1].y);vertices.push(points[index+1].z);

    vertices.push(points[index+1].x);vertices.push(lowestElevation);vertices.push(points[index+1].z);
    vertices.push(points[index+1].x);vertices.push(points[index+1].y);vertices.push(points[index+1].z);
    vertices.push(point.x);vertices.push(lowestElevation);vertices.push(point.z);
  }

  vertices.push(0);vertices.push(lowestElevation);vertices.push(0);
  vertices.push(0);vertices.push(0);vertices.push(0);
  vertices.push(maxWidth);vertices.push(0);vertices.push(0);

  vertices.push(maxWidth);vertices.push(0);vertices.push(0);
  vertices.push(maxWidth);vertices.push(lowestElevation);vertices.push(0);
  vertices.push(0);vertices.push(lowestElevation);vertices.push(0);

  geometry.setAttribute('position', new THREE.BufferAttribute( new Float32Array(vertices), 3 ))
  console.log(Math.floor(Math.random()*16777215).toString(16))
  const material = new THREE.MeshBasicMaterial( { color: `#${Math.floor(Math.random()*16777215).toString(16)}` } );

  // const geometry = new THREE.BufferGeometry().setFromPoints(points);

  const numTicksx = 4
  const numTicksy = 4

  return (
    <>
      <mesh geometry={geometry} material={material} >
        {
          [...Array(numTicksx).keys()].map((tick) => {
            return (
              <Text
                scale={[4, 4, 4]}
                fontSize={4}
                position={[-40, ySize*(tick)/(numTicksx-1), 0]}
                rotation={[0, 0, 0]}
              >
                ${(maxPrice*tick/numTicksx).toFixed(2)}
              </Text>
            )
          })
        }
        {
          [...Array(numTicksy).keys()].map((tick) => {
            const date = new Date(data.dates[Math.floor((data.dates.length-1)*tick/numTicksy)])
            return (
              <Text
                scale={[4, 4, 4]}
                fontSize={4}
                position={[xSize*(tick)/(numTicksy-1), -20, 0]}
                rotation={[0, 0, 0]}
              >
                {`${date.getDate()}/${date.getMonth()+1}/${date.getFullYear().toString().slice(2, 4)}`}
              </Text>
            )
          })
        }
        <Image scale={[20, 20]} position={[xSize+20, 50, 0]} url={tokenData.logo} />
        <Text
          scale={[4, 4, 4]}
          fontSize={5}
          position={[xSize+70, 50, 0]}
          rotation={[0, 0, 0]}
        >
          {tokenData.symbol}
        </Text>
      </mesh>
    </>
  );
};

// const data = [
//   generateRandomNumbers(200, 10, 30),
//   generateRandomNumbers(200, 10, 30),
// ];


export const PerpetualGraph = () => {
  const ref = useRef(null);
  const xSize = 600;
  const ySize = 360;
  const gridSize = 40;

  const [data, setData] = useState<{
    name: string;
    symbol: string;
    logo: string;
  }[]>()
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    const data = [
      {
        name: 'ethereum',
        symbol: 'ETH',
        logo: `tokens/ethereum.svg`
      },
      {
        name: 'bitcoin',
        symbol: 'BTC',
        logo: `tokens/bitcoin.svg`
      },
      {
        name: 'solana',
        symbol: 'SOL',
        logo: `tokens/solana.svg`
      },
      {
        name: 'avalanche-2',
        symbol: 'AVAX',
        logo: `tokens/avalanche.svg`
      },
      {
        name: 'binancecoin',
        symbol: 'BNB',
        logo: `tokens/bnb.svg`
      },
      {
        name: 'fantom',
        symbol: 'FTM',
        logo: `tokens/fantom.svg`
      },
      {
        name: 'matic-network',
        symbol: 'MATIC',
        logo: `tokens/matic.svg`
      },
      {
        name: 'solana',
        symbol: 'SOL',
        logo: `tokens/solana.svg`
      },
      {
        name: 'tron',
        symbol: 'TRX',
        logo: `tokens/tron.svg`
      }
    ]
    setData(data)
  }, [])

  const numGraphs = 5

  return (
    <div className={styles.scene}>
      <Canvas
        id="threeCanvas"
        ref={ref}
        shadows={true}
        className={styles.canvas}
      >
        <ambientLight />
        <PerspectiveCamera position={[0, ySize/2, xSize*1.5]} makeDefault far={8000}/>
        <OrbitControls />
        <ambientLight color={"gray"} intensity={0.3} />
        <mesh position={[-xSize/2, -ySize/2, -xSize/2]}>
          <mesh rotation={[0,3*Math.PI/2,0]}>
            <Plane width={xSize} height={ySize} size={gridSize}/>
          </mesh>
          <mesh rotation={[Math.PI/2, 0, 0]}>
            <Plane width={xSize} height={xSize} size={gridSize}/>
          </mesh>
          {
            data?.slice(selectedIndex, selectedIndex+numGraphs).concat(data.slice(0, Math.max(0, selectedIndex+numGraphs-data.length))).reverse().map((tokenData, index)=> 
            <mesh position={[0, 0, (index)*(xSize/(numGraphs-1))]}>
              <LineGraph tokenData={tokenData} ySize={ySize} xSize={xSize} granularity={2}/>
            </mesh>)
          }
        </mesh>
      </Canvas>
      <div className={styles.selector}>
        <Scrollbars autoHide autoHideTimeout={1000} style={{overflow: 'hidden'}}>
          {
            data?.map((token, index)=> {
              return (
                <button onClick={()=>setSelectedIndex(index)}>
                  <img width={'15px'} src={token.logo}/>
                  {token.symbol}
                </button>
              )
            })
          }
        </Scrollbars>
      </div>
    </div>
  );
};
