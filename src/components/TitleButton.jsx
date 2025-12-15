import * as motion from "motion/react-client"
import HomeLogo from "../images/WebAppHomeLogo.png"

export default function Gestures() {
    return (
        <motion.div
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
            style={box}
        >
            <img 
                src={HomeLogo}
                alt="HomeLogo"
            />
        </motion.div>
    )
}

// STYLES

const box = {
    width: 40,
    height: 40,
    backgroundColor: "#00BCD4",
    borderRadius: 5,
}
