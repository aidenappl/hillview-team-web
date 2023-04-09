interface Props {
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
  type?: InputTypes;
  className?: string;
  wrapperClassName?: string;
  label?: string;
}

type InputTypes = "text" | "password";

const LoginInputText = (props: Props) => {
  const {
    value,
    setValue = () => {},
    placeholder,
    type = "text",
    className,
    wrapperClassName,
    label,
  } = props;

  return (
    <div
      className={"w-full h-fit flex flex-col gap-2 " + props.wrapperClassName}
    >
      <label className="font-medium">{props.label}</label>
      <input
        type={type}
        value={props.value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={props.placeholder}
        className={
          "border-2 border-[#f0f2f4] rounded-xl pl-5 py-4 ß" + props.className
        }
      />
    </div>
  );
};

export default LoginInputText;
