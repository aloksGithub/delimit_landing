import {useRef} from "react";
import * as THREE from "three";
import {useFrame} from "@react-three/fiber";

type LineProps = {
  start: number[];
  end: number[];
};

function Line(props: LineProps) {
  const ref = useRef(null);

  useFrame(() => {
    if (ref.current) {
      // @ts-ignore
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

export default Plane