import * as THREE from "three";
import { Image, Text } from "@react-three/drei";
import UsePrice from "./UsePrice";
import { useRef } from "react";

const LineGraph = ({
  tokenData,
  ySize,
  xSize,
  granularity,
}: {
  tokenData: {name: string, symbol: string, logo: string, color: string};
  ySize: number;
  xSize: number;
  granularity: number;
}) => {
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
  }

  vertices.push(0);vertices.push(lowestElevation);vertices.push(0);
  vertices.push(0);vertices.push(0);vertices.push(0);
  vertices.push(maxWidth);vertices.push(0);vertices.push(0);

  vertices.push(maxWidth);vertices.push(0);vertices.push(0);
  vertices.push(maxWidth);vertices.push(lowestElevation);vertices.push(0);
  vertices.push(0);vertices.push(lowestElevation);vertices.push(0);

  geometry.setAttribute('position', new THREE.BufferAttribute( new Float32Array(vertices), 3 ))
  const material = new THREE.MeshBasicMaterial( { color: tokenData.color } );
  material.side = THREE.DoubleSide

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
        <Image scale={[30, 30]} position={[xSize+20, 50, 0]} url={tokenData.logo} transparent opacity={1}/>
        <Image scale={[30, 30]} position={[xSize+20, 50, 0]} rotation={[Math.PI, 0, 0]} url={tokenData.logo} transparent opacity={1}/>
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

export default LineGraph