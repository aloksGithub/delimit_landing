import styles from "./PerpetualGraph.module.css";
import {useEffect, useState, useRef, useReducer} from "react";
import {Canvas} from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Scrollbars } from 'react-custom-scrollbars';
import Plane from "./Plane";
import LineGraph from "./LineGraph";

export const PerpetualGraph = () => {
  const ref = useRef(null);
  const xSize = 600;
  const ySize = 360;
  const gridSize = 40;

  const [data, setData] = useState<{
    name: string;
    symbol: string;
    logo: string;
    color: string;
  }[]>()
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    const data = [
      {
        name: 'bitcoin',
        symbol: 'BTC',
        logo: `tokens/bitcoin.svg`,
        color: '#E9A937'
      },
      {
        name: 'ethereum',
        symbol: 'ETH',
        logo: `tokens/ethereum.svg`,
        color: '#626262'
      },
      {
        name: 'solana',
        symbol: 'SOL',
        logo: `tokens/solana.svg`,
        color: '#7EA0CF'
      },
      {
        name: 'avalanche-2',
        symbol: 'AVAX',
        logo: `tokens/avalanche.svg`,
        color: '#E84142'
      },
      {
        name: 'binancecoin',
        symbol: 'BNB',
        logo: `tokens/bnb.svg`,
        color: '#E2C43D'
      },
      {
        name: 'fantom',
        symbol: 'FTM',
        logo: `tokens/fantom.svg`,
        color: '#56C1DB'
      },
      {
        name: 'matic-network',
        symbol: 'MATIC',
        logo: `tokens/matic.svg`,
        color: '#8E41D7'
      },
      {
        name: 'tron',
        symbol: 'TRX',
        logo: `tokens/tron.svg`,
        color: '#F72429'
      }
    ]
    setData(data)
  }, [])

  const numGraphs = 4

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
        <Scrollbars universal={true}>
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
