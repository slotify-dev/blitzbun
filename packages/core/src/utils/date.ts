export function utcFromLocal(date: Date) {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    )
  );
}

export function utcFromIsoStr(str: string) {
  const parts = str.match(/\d+/g) as RegExpMatchArray;
  return new Date(
    Date.UTC(
      Number(parts[0]),
      Number(parts[1]) - 1,
      Number(parts[2]),
      Number(parts[3] || 0),
      Number(parts[4] || 0),
      Number(parts[5] || 0)
    )
  );
}
