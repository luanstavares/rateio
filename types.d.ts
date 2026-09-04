declare module "phosphor-react" {
  import type { ComponentType } from "react";

  export interface IconProps {
    weight?: string;
    size?: string | number;
    color?: string;
  }

  export const ArrowRight: ComponentType<IconProps>;
  export const CheckSquare: ComponentType<IconProps>;
  export const List: ComponentType<IconProps>;
  export const Square: ComponentType<IconProps>;
  export const User: ComponentType<IconProps>;
  export const UsersThree: ComponentType<IconProps>;
}
