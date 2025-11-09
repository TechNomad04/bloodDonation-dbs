import { useLocation } from "react-router-dom"

const Home = () => {
    try {
        const location = useLocation()
        const loggedIn = location.state.isloggedin
        console.log(loggedIn)
        return (
            <div>
                {loggedIn ? (
                    <div>
                        <button>Donate</button>
                        <button>Seach for banks</button>
                        <button>Search for match</button>
                    </div>
                ): (
                    <div>Please login first</div>
                )}
            </div>
        )
    } catch (err) {
        return (
            <div>Please login</div>
        )
    }
}

export default Home