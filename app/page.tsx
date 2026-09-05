"use client";

import React from "react";
import Link from "next/link";

import { Button } from "../ui/components/ui/button";

// Local Components
import Logo from "../ui/logo";

import { mainContent } from "../lib/data/home/data";
import Drawings from "../ui/drawings";

export default function Home() {
    const { title, subtitle, options } = mainContent();

    return (
        <section className="relative isolate flex min-h-[calc(100dvh-6.25rem)] w-full items-center overflow-hidden px-6 py-10 sm:px-10 lg:px-16">
            <Drawings />

            <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center text-center lg:max-w-xl">
                <div className="flex flex-col items-center gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
                        Divida com clareza
                    </p>
                    <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
                        {title}{" "}
                        <Logo
                            size="small"
                            className="text-4xl sm:text-5xl md:text-6xl"
                        />
                    </h1>
                    <p className="max-w-md text-sm text-muted-foreground sm:text-base">
                        {subtitle}
                    </p>
                </div>

                <div className="mt-12 flex w-full flex-col items-center justify-center gap-4">
                    {options.map((option, index) => {
                        if (index === 0) {
                            return (
                                <Button
                                    asChild
                                    key={option.title}
                                    className="min-w-44"
                                >
                                    <Link href={option.href}>
                                        {option.icon}
                                        {option.title}
                                    </Link>
                                </Button>
                            );
                        } else {
                            return (
                                <React.Fragment key={option.title}>
                                    <span className="text-sm text-muted-foreground">ou</span>
                                    <Button
                                        asChild
                                        className="min-w-60"
                                        variant="outline"
                                    >
                                        <Link href={option.href}>
                                            {option.title}
                                            {option.icon}
                                        </Link>
                                    </Button>
                                </React.Fragment>
                            );
                        }
                    })}
                </div>
            </div>
        </section>
    );
}
