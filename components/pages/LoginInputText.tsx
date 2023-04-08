interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  wrapperClassName?: string;
  label?: string;
}

const LoginInputText = (props: Props) => {
  return (
    <div
      className={"w-full h-fit flex flex-col gap-2 " + props.wrapperClassName}
    >
      <label className="font-medium">{props.label}</label>
      <input
        type="text"
        placeholder={props.placeholder}
        className={
          "border-2 border-[#f0f2f4] rounded-xl pl-5 py-4 ß" + props.className
        }
      />
    </div>
  );
};

export default LoginInputText;
