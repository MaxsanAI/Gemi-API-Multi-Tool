export interface Feature {
  title: string;
  icon: JSX.Element;
  description: string;
  component: () => JSX.Element;
}
