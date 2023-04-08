interface Props {
  text: string;
  className?: string;
}

const LineBreakText = (props: Props) => {
  return (
    <div
      className={"w-full bg-[#f0f2f4] h-[2px] relative my-5 " + props.className}
    >
      <a className="bg-white px-4 text-[#e2e2e3] full-center whitespace-nowrap">
        {props.text}
      </a>
    </div>
  );
};

export default LineBreakText;
