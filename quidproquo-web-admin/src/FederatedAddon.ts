import { ReactNode } from 'react';

export type FederatedAddon = {
  add: (a: number, b: number) => number;
  AsyncButton: ({
    onClick,
    children,
    disabled,
    style,
    type,
  }: {
    onClick: (event: any) => Promise<void>;
    children?: ReactNode;
    disabled?: boolean;
    style?: React.CSSProperties;
    type?: 'button' | 'submit' | 'reset';
  }) => JSX.Element;
};
