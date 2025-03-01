'use client';

import { redirect } from 'next/navigation';

export default function CatchAllNotFound() {
  redirect('/pagenotfound');
}
