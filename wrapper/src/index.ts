export const search = async (store: string, fuz: string, url: string = 'https://i.zephyr/'): Promise<Record<string, string>[]> => {
  return fetch(`${url}${store}?search=${fuz}`)
    .then(r => r.json());
}

export const upload = async (store: string, data: any[], url: string = 'https://i.zephyr/'): Promise<Record<string, string>[]> => {
  const formData = new FormData();
  for (const name of data) {
    formData.append(name, data[name]);
  }

  return (await fetch(url + store, {
    method: 'POST',
    body: formData
  })).json()
}
