"use client";
import React from "react";
import ProfileLogin from "./ProfileLogin";
import HomeButton from "./HomeButton";

const Header = () => {
  return (
    <div
      className={`flex
				flex-row
				justify-between
				items-center
				bg-gradient-to-b
				from-black
				to-rose-950
				mb-8
				pt-1.5
				pb-1`}
    >
      <HomeButton />
      <ProfileLogin />
    </div>
  );
};

export default Header;
