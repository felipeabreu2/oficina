"use client"

import { useState, useEffect } from "react"

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const addProduct = async (product: any) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      })
      if (response.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error("Error adding product:", error)
    }
  }

  const updateProduct = async (id: string, updates: any) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (response.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error("Error updating product:", error)
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  }
}

export function useClients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients")
      const data = await response.json()
      setClients(data)
    } catch (error) {
      console.error("Error fetching clients:", error)
    } finally {
      setLoading(false)
    }
  }

  const addClient = async (client: any) => {
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(client),
      })
      if (response.ok) {
        fetchClients()
      }
    } catch (error) {
      console.error("Error adding client:", error)
    }
  }

  const updateClient = async (id: string, updates: any) => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (response.ok) {
        fetchClients()
      }
    } catch (error) {
      console.error("Error updating client:", error)
    }
  }

  const deleteClient = async (id: string) => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        fetchClients()
      }
    } catch (error) {
      console.error("Error deleting client:", error)
    }
  }

  return {
    clients,
    loading,
    addClient,
    updateClient,
    deleteClient,
    refetch: fetchClients,
  }
}

export function useSales() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = async () => {
    try {
      const response = await fetch("/api/sales")
      const data = await response.json()
      setSales(data)
    } catch (error) {
      console.error("Error fetching sales:", error)
    } finally {
      setLoading(false)
    }
  }

  const addSale = async (sale: any) => {
    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sale),
      })
      if (response.ok) {
        fetchSales()
      }
    } catch (error) {
      console.error("Error adding sale:", error)
    }
  }

  return {
    sales,
    loading,
    addSale,
    refetch: fetchSales,
  }
}

export function useBudgets() {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    try {
      const response = await fetch("/api/budgets")
      const data = await response.json()
      setBudgets(data)
    } catch (error) {
      console.error("Error fetching budgets:", error)
    } finally {
      setLoading(false)
    }
  }

  const addBudget = async (budget: any) => {
    try {
      const response = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(budget),
      })
      if (response.ok) {
        fetchBudgets()
      }
    } catch (error) {
      console.error("Error adding budget:", error)
    }
  }

  const convertBudgetToSale = async (budgetId: string, paymentMethod: string) => {
    try {
      const response = await fetch(`/api/budgets/${budgetId}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod }),
      })
      if (response.ok) {
        fetchBudgets()
      }
    } catch (error) {
      console.error("Error converting budget:", error)
    }
  }

  return {
    budgets,
    loading,
    addBudget,
    convertBudgetToSale,
    refetch: fetchBudgets,
  }
}

export function useDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  return {
    stats,
    loading,
    refetch: fetchStats,
  }
}
