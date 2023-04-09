import { Oval } from "react-loader-spinner";

interface Props {
  wrapperClass?: string;
  size?: number;
  style?: SpinnerStyles;
}

type SpinnerStyles = "default" | "light";

const Spinner = (props: Props) => {
  const { wrapperClass, size = 30, style = "default" } = props;
  return (
    <Oval
      height={size}
      width={size}
      color={
        style === "default" ? "#192536" : "#fefefe"
      }
      wrapperStyle={{}}
      wrapperClass={wrapperClass}
      visible={true}
      ariaLabel="oval-loading"
      secondaryColor={
        style === "default" ? "#38414f" : "#fefefe"
      }
      strokeWidth={6}
      strokeWidthSecondary={6}
    />
  );
};

export default Spinner;
