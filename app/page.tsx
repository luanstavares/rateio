"use client";
import React from "react";

import { Button } from "../ui/components/ui/button";

// Local Components
import Logo from "../ui/logo";

import { mainContent } from "../lib/data/home/data";
import Drawings from "../ui/drawings";

export default function Home() {
    const { title, subtitle, options } = mainContent();

    return (
        <>
            <Drawings />

            <div className="text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                    <h1 className="text-[39px] font-bold leading-tight sm:text-[49px]">
                        {title}{" "}
                        <Logo
                            size="small"
                            className="sm:text-[50px]"
                        />
                    </h1>
                    <p className="text-sm sm:text-base">{subtitle}</p>
                </div>
            </div>

            <div className="mt-16">
                <div className="flex flex-col items-center justify-center gap-4">
                    {options.map((option, index) => {
                        if (index === 0) {
                            return (
                                <Button
                                    key={option.title}
                                    type="button"
                                >
                                    {option.icon}
                                    {option.title}
                                </Button>
                            );
                        } else {
                            return (
                                <React.Fragment key={option.title}>
                                    <span className="text-base">ou</span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                    >
                                        {option.title}
                                        {option.icon}
                                    </Button>
                                </React.Fragment>
                            );
                        }
                    })}
                </div>
            </div>
        </>
    );
}
