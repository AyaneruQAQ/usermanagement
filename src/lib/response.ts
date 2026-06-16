import { NextResponse } from 'next/server';

export function success<T>(data: T, message = 'ok') {
  return NextResponse.json({ code: 0, message, data });
}

export function error(code: number, message: string) {
  return NextResponse.json({ code, message, data: null }, { status: code >= 500 ? code : 200 });
}
