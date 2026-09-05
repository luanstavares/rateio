"use client";

import { useEffect } from "react";

import { clearAnonymousSession } from "../app/actions/rateios";

export default function ClearAnonymousSession() {
  useEffect(() => {
    void clearAnonymousSession();
  }, []);

  return null;
}
