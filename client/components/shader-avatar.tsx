"use client";

import { MeshGradient } from "@paper-design/shaders-react";
import { Avatar } from "./avatar";

export default function ShaderAvatar() {
  return (
    <Avatar className="size-8">
      <MeshGradient
        colors={["#382e2e", "#75c1f0", "#000000"]}
        distortion={1}
        swirl={0.3}
        speed={0.9}
        style={{ width: 40, height: 40 }}
        scale={1.1}
      />
    </Avatar>
  );
}
