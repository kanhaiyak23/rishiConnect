import React from "react";
import Svg, { Path } from "react-native-svg";

export function CurvedNotch() {
  return (
    <Svg width="100%" height={130} viewBox="0 0 392.727 130">
      <Path
        d={`
          M0 0
          H392.727
          Q196.3636 125 0 0
        `}
        fill="#1A1A1A"
      />
    </Svg>
  );
}
