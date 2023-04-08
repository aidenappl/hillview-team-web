interface Props {
    children: React.ReactNode;
    className?: string;
}

const PageContainer = (props: Props) => {
    return (
        <div className={"w-full h-screen " + props.className}>
            {props.children}
        </div>
    )
}

export default PageContainer