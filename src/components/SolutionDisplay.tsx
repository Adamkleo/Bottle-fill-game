import './SolutionDisplay.css';


function SolutionDisplay({ solution }: any) {
    console.log(solution)
    return (
        <div>
            <a className="game-solution-header">Solution</a>
        </div>
    );
}

export default SolutionDisplay;