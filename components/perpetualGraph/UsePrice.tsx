import { useEffect, useState } from "react";


const UsePrice = (currency: string) => {
  const [data, setData] = useState<{
    prices: number[];
    dates: any[];
  }>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null);

  const fetchPrices = async () => {
    try {
      const query = `https://api.coingecko.com/api/v3/coins/${currency}/market_chart?vs_currency=usd&days=max&interval=daily`
      const data = await (await fetch(query)).json()
      const priceData = data.prices
      const dates = priceData.map((price: any)=>price[0])
      const prices = priceData.map((price: any)=>price[1])
      setData({prices, dates})
    } catch (error) {
      setError(error)
    }
  }

  useEffect(() => {
    fetchPrices()
  }, [currency])

  return {data, loading, error}
}

export default UsePrice