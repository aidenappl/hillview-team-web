import TeamContainer from "../../../components/pages/team/TeamContainer";

const AssetsPage = () => {
    return (
        <TeamContainer pageTitle="Assets">
            <h1>Assets</h1>
        </TeamContainer>
    )
}

export default AssetsPage

export const getStaticProps = () => {
	return {
		props: {
			requireAuth: true,
			requireAccountStatus: 'admin',
			title: 'Hillview Team - Assets',
		},
	};
};
