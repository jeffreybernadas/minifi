import { Image, Text, UnstyledButton } from "@mantine/core";
import { Link } from "react-router-dom";
import logo from "@/assets/images/logo.png";
import classes from "./Logo.module.css";

const Logo = () => {
	return (
		<UnstyledButton component={Link} to="/" className={classes.logo}>
			<Image src={logo} alt="Minifi" width={32} height={32} />
			<Text size="xl" fw={700} c="blue">
				Minifi
			</Text>
		</UnstyledButton>
	);
};

export default Logo;
