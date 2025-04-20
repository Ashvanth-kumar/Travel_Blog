import React from 'react';
import { Link } from 'react-scroll';

// ✅ Importing the local video file
import Video from '../../assets/screenshots/trip-tide.mp4';

const Hero = () => {
	return (
		<>
			<div className="hero w-full h-screen relative text-white">
				{/* ✅ Use the imported video */}
				<video autoPlay loop muted id="video" className="w-full h-full object-cover z-[-5]">
					<source src={Video} type="video/mp4" />
				</video>

				<div className="overlay bg-[#00000016]"></div>

				<div className="content w-full h-full m-auto p-4 absolute top-0 flex flex-col justify-center items-center">
					<h1 className="text-2xl md:text-5xl">An ocean of possibilities</h1>
					<h2 className="my-4 text-xl md:text-4xl">The whole world awaits</h2>
					<Link to="search" smooth={true} duration={500}>
						<button className="px-6 py-3 bg-blue-500 rounded-md hover:bg-blue-600 transition">
							Get Started
						</button>
					</Link>
				</div>
			</div>
		</>
	);
};

export default Hero;
