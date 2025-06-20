"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  Wrench,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Calendar,
  MessageSquare,
  Smartphone,
  Edit,
  MoreHorizontal,
  Eye,
  Trash,
  Plus,
  Search,
  ArrowLeft,
  Save,
  FileText,
  Mail,
  Phone,
  MapPin,
  Car,
  Receipt,
  Download,
  Settings,
  Bell,
  User,
  LogOut,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Hooks
import { useProducts, useClients, useSales, useBudgets, useDashboard } from "@/hooks/useDatabase"

// Types
interface Product {
  id: string
  type: string
  brand: string
  model: string
  size: string
  price: number
  stock: number
  condition?: number
  minStock?: number
  costPrice?: number
}

interface Client {
  id: string
  name: string
  document: string
  phone: string
  email: string
  address?: string
  vehicles: Vehicle[]
  lastPurchase?: string
  totalSpent: number
}

interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
  year: number
  frontTires: string
  rearTires: string
}

interface SaleItem {
  id: number
  productId: string
  product: string
  quantity: number
  unitPrice: number
  discount: number
}

interface Sale {
  id: string
  clientId: string
  client: string
  items: SaleItem[]
  subtotal: number
  generalDiscount: number
  total: number
  date: string
  payment: string
  status: string
}

interface Budget {
  id: string
  clientId: string
  client: string
  items: SaleItem[]
  subtotal: number
  generalDiscount: number
  total: number
  date: string
  validity: string
  status: string
}

interface Installment {
  id: string
  saleId: string
  clientId: string
  client: string
  totalValue: number
  paidValue: number
  remainingValue: number
  installments: string
  nextDue: string
  parcelas: Parcela[]
}

interface Parcela {
  numero: number
  valor: number
  vencimento: string
  status: string
  dataPagamento?: string
}

export default function TireShopDashboard() {
  const [activeModule, setActiveModule] = useState("dashboard")
  const [currentView, setCurrentView] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showNotifications, setShowNotifications] = useState(false)

  // Database hooks
  const { products, addProduct, updateProduct, deleteProduct } = useProducts()
  const { clients, addClient, updateClient, deleteClient } = useClients()
  const { sales, addSale } = useSales()
  const { budgets, addBudget, convertBudgetToSale } = useBudgets()
  const { stats } = useDashboard()

  const modules = [
    { id: "dashboard", name: "Dashboard", icon: BarChart3 },
    { id: "estoque", name: "Estoque", icon: Package },
    { id: "clientes", name: "Clientes", icon: Users },
    { id: "vendas", name: "Vendas", icon: ShoppingCart },
    { id: "financeiro", name: "Financeiro", icon: DollarSign },
    { id: "servicos", name: "Serviços", icon: Wrench },
    { id: "relatorios", name: "Relatórios", icon: BarChart3 },
  ]

  const stockAlerts = products.filter((p: any) => p.stock <= (p.minStock || 5))
  const installments: any[] = [] // Keep empty for now until we implement installments API

  const recentSales = sales.slice(-3).map((sale: any) => ({
    id: sale.id,
    customer: sale.client,
    total: `R$ ${sale.total.toFixed(2)}`,
    status: sale.status,
  }))

  const upcomingServices = [
    { customer: "Auto Posto Central", service: "Alinhamento + Balanceamento", time: "09:00" },
    { customer: "Transportadora ABC", service: "Troca de Pneus", time: "14:30" },
    { customer: "Carlos Mendes", service: "Revisão Completa", time: "16:00" },
  ]

  // Navigation functions remain the same
  const goToView = (view: string, item?: any) => {
    setCurrentView(view)
    setSelectedItem(item)
  }

  const goBack = () => {
    setCurrentView(null)
    setSelectedItem(null)
  }

  // CRUD functions now use the hooks
  const handleAddProduct = async (product: Omit<any, "id">) => {
    await addProduct(product)
  }

  const handleUpdateProduct = async (id: string, updates: Partial<any>) => {
    await updateProduct(id, updates)
  }

  const handleDeleteProduct = async (id: string) => {
    await deleteProduct(id)
  }

  const handleAddClient = async (client: Omit<any, "id" | "totalSpent">) => {
    await addClient(client)
  }

  const handleUpdateClient = async (id: string, updates: Partial<any>) => {
    await updateClient(id, updates)
  }

  const handleDeleteClient = async (id: string) => {
    await deleteClient(id)
  }

  const handleAddSale = async (sale: Omit<any, "id">) => {
    await addSale(sale)
  }

  const handleAddBudget = async (budget: Omit<any, "id">) => {
    await addBudget(budget)
  }

  const handleConvertBudgetToSale = async (budgetId: string) => {
    await convertBudgetToSale(budgetId, "À Vista")
  }

  // Render current view
  if (currentView) {
    const renderModalContent = () => {
      switch (currentView) {
        case "add-product":
          return <AddProductView onSave={handleAddProduct} onCancel={goBack} />
        case "edit-product":
          return <EditProductView product={selectedItem} onSave={handleUpdateProduct} onCancel={goBack} />
        case "add-client":
          return <AddClientView onSave={handleAddClient} onCancel={goBack} />
        case "edit-client":
          return <EditClientView client={selectedItem} onSave={handleUpdateClient} onCancel={goBack} />
        case "new-sale":
          return (
            <NewSaleView
              products={products}
              clients={clients}
              onSave={handleAddSale}
              onSaveBudget={handleAddBudget}
              onCancel={goBack}
            />
          )
        default:
          return null
      }
    }

    const renderViewContent = () => {
      switch (currentView) {
        case "view-product":
          return (
            <ViewProductView
              product={selectedItem}
              onEdit={() => goToView("edit-product", selectedItem)}
              onBack={goBack}
            />
          )
        case "view-client":
          return (
            <ViewClientView
              client={selectedItem}
              onEdit={() => goToView("edit-client", selectedItem)}
              onBack={goBack}
            />
          )
        case "view-budget":
          return <ViewBudgetView budget={selectedItem} onConvert={handleConvertBudgetToSale} onBack={goBack} />
        case "view-sale":
          return <ViewSaleView sale={selectedItem} onBack={goBack} />
        case "view-installment":
          return <ViewInstallmentView installment={selectedItem} onBack={goBack} />
        default:
          return null
      }
    }

    // For form views, use full screen
    if (["add-product", "edit-product", "add-client", "edit-client", "new-sale"].includes(currentView)) {
      return <div className="min-h-screen bg-gray-50">{renderModalContent()}</div>
    }

    // For view/detail pages, use modal
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header and Sidebar remain the same */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AutoGest Pro</h1>
                <p className="text-sm text-gray-500">Sistema de Gestão para Oficinas</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button variant="outline" size="sm">
                <Smartphone className="w-4 h-4 mr-2" />
                Mobile
              </Button>
              <div className="relative">
                <Button variant="outline" size="sm" onClick={() => setShowNotifications(!showNotifications)}>
                  <Bell className="w-4 h-4" />
                  {stockAlerts.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {stockAlerts.length}
                    </span>
                  )}
                </Button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">Notificações</h3>
                      {stockAlerts.length > 0 ? (
                        <div className="space-y-2">
                          {stockAlerts.map((product) => (
                            <Alert key={product.id}>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                {product.brand} {product.model} - Estoque baixo ({product.stock} unidades)
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">Nenhuma notificação</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
            <nav className="p-4">
              <ul className="space-y-2">
                {modules.map((module) => {
                  const Icon = module.icon
                  return (
                    <li key={module.id}>
                      <button
                        onClick={() => setActiveModule(module.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeModule === module.id
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{module.name}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {activeModule === "dashboard" && (
              <DashboardView
                stockAlerts={stockAlerts}
                recentSales={recentSales}
                upcomingServices={upcomingServices}
                totalProducts={stats?.totalProducts || 0}
                totalClients={stats?.totalClients || 0}
                totalSales={stats?.totalSales || 0}
              />
            )}
            {activeModule === "estoque" && (
              <EstoqueModule
                products={products}
                onAddProduct={() => goToView("add-product")}
                onEditProduct={(product) => goToView("edit-product", product)}
                onViewProduct={(product) => goToView("view-product", product)}
                onDeleteProduct={handleDeleteProduct}
              />
            )}
            {activeModule === "clientes" && (
              <ClientesModule
                clients={clients}
                onAddClient={() => goToView("add-client")}
                onEditClient={(client) => goToView("edit-client", client)}
                onViewClient={(client) => goToView("view-client", client)}
                onDeleteClient={handleDeleteClient}
              />
            )}
            {activeModule === "vendas" && (
              <VendasModule
                sales={sales}
                budgets={budgets}
                installments={installments}
                onNewSale={() => goToView("new-sale")}
                onViewBudget={(budget) => goToView("view-budget", budget)}
                onViewSale={(sale) => goToView("view-sale", sale)}
                onViewInstallment={(installment) => goToView("view-installment", installment)}
                onConvertBudget={handleConvertBudgetToSale}
              />
            )}
            {activeModule === "financeiro" && <FinanceiroModule />}
            {activeModule === "servicos" && <ServicosModule />}
            {activeModule === "relatorios" && <RelatoriosModule products={products} clients={clients} sales={sales} />}
          </main>
        </div>

        {/* Modal Dialog for view pages */}
        <Dialog open={true} onOpenChange={goBack}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">{renderViewContent()}</DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AutoGest Pro</h1>
              <p className="text-sm text-gray-500">Sistema de Gestão para Oficinas</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button variant="outline" size="sm">
              <Smartphone className="w-4 h-4 mr-2" />
              Mobile
            </Button>
            <div className="relative">
              <Button variant="outline" size="sm" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell className="w-4 h-4" />
                {stockAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {stockAlerts.length}
                  </span>
                )}
              </Button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">Notificações</h3>
                    {stockAlerts.length > 0 ? (
                      <div className="space-y-2">
                        {stockAlerts.map((product) => (
                          <Alert key={product.id}>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              {product.brand} {product.model} - Estoque baixo ({product.stock} unidades)
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Nenhuma notificação</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              {modules.map((module) => {
                const Icon = module.icon
                return (
                  <li key={module.id}>
                    <button
                      onClick={() => setActiveModule(module.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeModule === module.id
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{module.name}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeModule === "dashboard" && (
            <DashboardView
              stockAlerts={stockAlerts}
              recentSales={recentSales}
              upcomingServices={upcomingServices}
              totalProducts={stats?.totalProducts || 0}
              totalClients={stats?.totalClients || 0}
              totalSales={stats?.totalSales || 0}
            />
          )}
          {activeModule === "estoque" && (
            <EstoqueModule
              products={products}
              onAddProduct={() => goToView("add-product")}
              onEditProduct={(product) => goToView("edit-product", product)}
              onViewProduct={(product) => goToView("view-product", product)}
              onDeleteProduct={handleDeleteProduct}
            />
          )}
          {activeModule === "clientes" && (
            <ClientesModule
              clients={clients}
              onAddClient={() => goToView("add-client")}
              onEditClient={(client) => goToView("edit-client", client)}
              onViewClient={(client) => goToView("view-client", client)}
              onDeleteClient={handleDeleteClient}
            />
          )}
          {activeModule === "vendas" && (
            <VendasModule
              sales={sales}
              budgets={budgets}
              installments={installments}
              onNewSale={() => goToView("new-sale")}
              onViewBudget={(budget) => goToView("view-budget", budget)}
              onViewSale={(sale) => goToView("view-sale", sale)}
              onViewInstallment={(installment) => goToView("view-installment", installment)}
              onConvertBudget={handleConvertBudgetToSale}
            />
          )}
          {activeModule === "financeiro" && <FinanceiroModule />}
          {activeModule === "servicos" && <ServicosModule />}
          {activeModule === "relatorios" && <RelatoriosModule products={products} clients={clients} sales={sales} />}
        </main>
      </div>
    </div>
  )
}

// Dashboard View
function DashboardView({
  stockAlerts,
  recentSales,
  upcomingServices,
  totalProducts,
  totalClients,
  totalSales,
}: {
  stockAlerts: Product[]
  recentSales: any[]
  upcomingServices: any[]
  totalProducts: number
  totalClients: number
  totalSales: number
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Principal</h2>
        <p className="text-gray-600">Visão geral do seu negócio</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> vs ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos em Estoque</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">{stockAlerts.length} alertas</span> de estoque baixo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5</span> novos esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serviços Agendados</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Para hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
              Alertas de Estoque
            </CardTitle>
            <CardDescription>Produtos com estoque baixo ou crítico</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stockAlerts.length > 0 ? (
                stockAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">
                        {alert.brand} {alert.model}
                      </p>
                      <p className="text-xs text-gray-600">{alert.stock} unidades restantes</p>
                    </div>
                    <Badge variant={alert.stock <= 2 ? "destructive" : "secondary"}>
                      {alert.stock <= 2 ? "Crítico" : "Baixo"}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum alerta de estoque</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Vendas Recentes
            </CardTitle>
            <CardDescription>Últimas transações realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSales.length > 0 ? (
                recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{sale.customer}</p>
                      <p className="text-xs text-gray-600">Pedido #{sale.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{sale.total}</p>
                      <Badge variant={sale.status === "Pago" ? "default" : "secondary"}>{sale.status}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhuma venda recente</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-500" />
            Agenda de Hoje
          </CardTitle>
          <CardDescription>Serviços agendados para hoje</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingServices.map((service, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">{service.time}</Badge>
                  <Wrench className="w-4 h-4 text-gray-400" />
                </div>
                <h4 className="font-medium text-sm mb-1">{service.customer}</h4>
                <p className="text-xs text-gray-600">{service.service}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Add Product View
function AddProductView({
  onSave,
  onCancel,
}: { onSave: (product: Omit<Product, "id">) => void; onCancel: () => void }) {
  const [productType, setProductType] = useState("pneu-novo")
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    size: "",
    price: 0,
    stock: 0,
    minStock: 5,
    costPrice: 0,
    condition: 10,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const product: Omit<Product, "id"> = {
      type:
        productType === "pneu-novo"
          ? "Pneu Novo"
          : productType === "pneu-usado"
            ? "Pneu Usado"
            : productType === "pneu-remold"
              ? "Pneu Remold"
              : productType === "pecas"
                ? "Peças/Utensílios"
                : "Serviço",
      brand: formData.brand,
      model: formData.model,
      size: formData.size,
      price: formData.price,
      stock: formData.stock,
      minStock: formData.minStock,
      costPrice: formData.costPrice,
      condition: productType === "pneu-usado" ? formData.condition : undefined,
    }
    onSave(product)
    onCancel()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cadastrar Novo Produto</h2>
          <p className="text-gray-600">Adicione um novo produto ao estoque</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Type Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Produto</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { id: "pneu-novo", label: "Pneu Novo" },
                  { id: "pneu-usado", label: "Pneu Usado" },
                  { id: "pneu-remold", label: "Pneu Remold" },
                  { id: "pecas", label: "Peças/Utensílios" },
                  { id: "servico", label: "Serviço" },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setProductType(type.id)}
                    className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                      productType === type.id
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Marca</label>
                <Input
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Ex: Michelin, Pirelli, Goodyear"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Modelo</label>
                <Input
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Ex: Energy XM2, P7, EfficientGrip"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Medida/Especificação</label>
                <Input
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  placeholder="Ex: 185/65R15"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Preço de Custo</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: Number.parseFloat(e.target.value) || 0 })}
                  placeholder="0,00"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Preço de Venda</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
                  placeholder="0,00"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Estoque Atual</label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number.parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Estoque Mínimo</label>
                <Input
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: Number.parseInt(e.target.value) || 0 })}
                  placeholder="5"
                  required
                />
              </div>
              {productType === "pneu-usado" && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Estado de Conservação (1-10)</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: Number.parseInt(e.target.value) || 10 })}
                    placeholder="8"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                Salvar Produto
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Edit Product View
function EditProductView({
  product,
  onSave,
  onCancel,
}: {
  product: Product
  onSave: (id: string, updates: Partial<Product>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    brand: product.brand,
    model: product.model,
    size: product.size,
    price: product.price,
    stock: product.stock,
    minStock: product.minStock || 5,
    costPrice: product.costPrice || 0,
    condition: product.condition || 10,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(product.id, formData)
    onCancel()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Editar Produto</h2>
          <p className="text-gray-600">
            {product.brand} {product.model} - {product.id}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Marca</label>
                <Input
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Modelo</label>
                <Input
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Medida/Especificação</label>
                <Input
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Preço de Custo</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: Number.parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Preço de Venda</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Estoque Atual</label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number.parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Estoque Mínimo</label>
                <Input
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: Number.parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              {product.condition && (
                <div>
                  <label className="text-sm font-medium mb-1 block">Estado de Conservação (1-10)</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: Number.parseInt(e.target.value) || 10 })}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// View Product View
function ViewProductView({
  product,
  onEdit,
  onBack,
}: {
  product: Product
  onEdit: () => void
  onBack: () => void
}) {
  const marginPercent = product.costPrice
    ? (((product.price - product.costPrice) / product.costPrice) * 100).toFixed(1)
    : "0"

  return (
    <div className="space-y-6">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {product.brand} {product.model}
            </DialogTitle>
            <p className="text-gray-600">Código: {product.id}</p>
          </div>
          <Button onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Tipo</label>
              <p className="font-medium">{product.type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Marca</label>
              <p className="font-medium">{product.brand}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Modelo</label>
              <p className="font-medium">{product.model}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Medida/Especificação</label>
              <p className="font-medium">{product.size}</p>
            </div>
            {product.condition && (
              <div>
                <label className="text-sm font-medium text-gray-500">Estado de Conservação</label>
                <p className="font-medium">{product.condition}/10</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações Financeiras</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Preço de Custo</label>
              <p className="font-medium">R$ {product.costPrice?.toFixed(2) || "0,00"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Preço de Venda</label>
              <p className="font-medium text-green-600">R$ {product.price.toFixed(2)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Margem de Lucro</label>
              <p className="font-medium">{marginPercent}%</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Controle de Estoque</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Estoque Atual</label>
              <p
                className={`font-medium ${product.stock <= (product.minStock || 5) ? "text-red-600" : "text-green-600"}`}
              >
                {product.stock} unidades
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Estoque Mínimo</label>
              <p className="font-medium">{product.minStock || 5} unidades</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <Badge variant={product.stock <= (product.minStock || 5) ? "destructive" : "default"}>
                {product.stock <= (product.minStock || 5) ? "Estoque Baixo" : "Estoque OK"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Valor Total em Estoque</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Valor de Custo</label>
              <p className="font-medium">R$ {((product.costPrice || 0) * product.stock).toFixed(2)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Valor de Venda</label>
              <p className="font-medium text-green-600">R$ {(product.price * product.stock).toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Add Client View
function AddClientView({
  onSave,
  onCancel,
}: { onSave: (client: Omit<Client, "id" | "totalSpent">) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    document: "",
    phone: "",
    email: "",
    address: "",
  })

  const [vehicles, setVehicles] = useState<Omit<Vehicle, "id">[]>([
    {
      plate: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      frontTires: "",
      rearTires: "",
    },
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const client: Omit<Client, "id" | "totalSpent"> = {
      ...formData,
      vehicles: vehicles.map((v, index) => ({ ...v, id: `V${index + 1}` })),
    }
    onSave(client)
    onCancel()
  }

  const addVehicle = () => {
    setVehicles([
      ...vehicles,
      {
        plate: "",
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        frontTires: "",
        rearTires: "",
      },
    ])
  }

  const updateVehicle = (index: number, updates: Partial<Omit<Vehicle, "id">>) => {
    setVehicles(vehicles.map((v, i) => (i === index ? { ...v, ...updates } : v)))
  }

  const removeVehicle = (index: number) => {
    setVehicles(vehicles.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cadastrar Novo Cliente</h2>
          <p className="text-gray-600">Adicione um novo cliente ao sistema</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Dados do Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Nome/Razão Social</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome completo ou razão social"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">CPF/CNPJ</label>
                  <Input
                    value={formData.document}
                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Telefone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="cliente@email.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1 block">Endereço</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Rua, número, bairro, cidade"
                  />
                </div>
              </div>
            </div>

            {/* Vehicles */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Veículos</h3>
                <Button type="button" variant="outline" onClick={addVehicle}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Veículo
                </Button>
              </div>
              <div className="space-y-4">
                {vehicles.map((vehicle, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Veículo {index + 1}</h4>
                      {vehicles.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removeVehicle(index)}>
                          <Trash className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Placa</label>
                        <Input
                          value={vehicle.plate}
                          onChange={(e) => updateVehicle(index, { plate: e.target.value })}
                          placeholder="ABC-1234"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Marca</label>
                        <Input
                          value={vehicle.brand}
                          onChange={(e) => updateVehicle(index, { brand: e.target.value })}
                          placeholder="Honda"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Modelo</label>
                        <Input
                          value={vehicle.model}
                          onChange={(e) => updateVehicle(index, { model: e.target.value })}
                          placeholder="Civic"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Ano</label>
                        <Input
                          type="number"
                          value={vehicle.year}
                          onChange={(e) =>
                            updateVehicle(index, { year: Number.parseInt(e.target.value) || new Date().getFullYear() })
                          }
                          placeholder="2020"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Pneus Dianteiros</label>
                        <Input
                          value={vehicle.frontTires}
                          onChange={(e) => updateVehicle(index, { frontTires: e.target.value })}
                          placeholder="185/65R15"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Pneus Traseiros</label>
                        <Input
                          value={vehicle.rearTires}
                          onChange={(e) => updateVehicle(index, { rearTires: e.target.value })}
                          placeholder="185/65R15"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                Salvar Cliente
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// Edit Client View
function EditClientView({
  client,
  onSave,
  onCancel,
}: {
  client: Client
  onSave: (id: string, updates: Partial<Client>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: client.name,
    document: client.document,
    phone: client.phone,
    email: client.email,
    address: client.address || "",
  })

  const [vehicles, setVehicles] = useState<Vehicle[]>(client.vehicles)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(client.id, { ...formData, vehicles })
    onCancel()
  }

  const addVehicle = () => {
    const newVehicle: Vehicle = {
      id: `V${vehicles.length + 1}`,
      plate: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      frontTires: "",
      rearTires: "",
    }
    setVehicles([...vehicles, newVehicle])
  }

  const updateVehicle = (index: number, updates: Partial<Vehicle>) => {
    setVehicles(vehicles.map((v, i) => (i === index ? { ...v, ...updates } : v)))
  }

  const removeVehicle = (index: number) => {
    setVehicles(vehicles.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Editar Cliente</h2>
          <p className="text-gray-600">
            {client.name} - {client.id}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Dados do Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Nome/Razão Social</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">CPF/CNPJ</label>
                  <Input
                    value={formData.document}
                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Telefone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-1 block">Endereço</label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Vehicles */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Veículos</h3>
                <Button type="button" variant="outline" onClick={addVehicle}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Veículo
                </Button>
              </div>
              <div className="space-y-4">
                {vehicles.map((vehicle, index) => (
                  <div key={vehicle.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Veículo {index + 1}</h4>
                      {vehicles.length > 1 && (
                        <Button type="button" variant="outline" size="sm" onClick={() => removeVehicle(index)}>
                          <Trash className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Placa</label>
                        <Input
                          value={vehicle.plate}
                          onChange={(e) => updateVehicle(index, { plate: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Marca</label>
                        <Input
                          value={vehicle.brand}
                          onChange={(e) => updateVehicle(index, { brand: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Modelo</label>
                        <Input
                          value={vehicle.model}
                          onChange={(e) => updateVehicle(index, { model: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Ano</label>
                        <Input
                          type="number"
                          value={vehicle.year}
                          onChange={(e) =>
                            updateVehicle(index, { year: Number.parseInt(e.target.value) || new Date().getFullYear() })
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Pneus Dianteiros</label>
                        <Input
                          value={vehicle.frontTires}
                          onChange={(e) => updateVehicle(index, { frontTires: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">Pneus Traseiros</label>
                        <Input
                          value={vehicle.rearTires}
                          onChange={(e) => updateVehicle(index, { rearTires: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// View Client View
function ViewClientView({
  client,
  onEdit,
  onBack,
}: {
  client: Client
  onEdit: () => void
  onBack: () => void
}) {
  return (
    <div className="space-y-6">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold text-gray-900">{client.name}</DialogTitle>
            <p className="text-gray-600">Código: {client.id}</p>
          </div>
          <Button onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nome/Razão Social</label>
              <p className="font-medium">{client.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">CPF/CNPJ</label>
              <p className="font-medium">{client.document}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Telefone</label>
              <p className="font-medium flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                {client.phone}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="font-medium flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                {client.email}
              </p>
            </div>
            {client.address && (
              <div>
                <label className="text-sm font-medium text-gray-500">Endereço</label>
                <p className="font-medium flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {client.address}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Total Gasto</label>
              <p className="font-medium text-green-600">R$ {client.totalSpent.toFixed(2)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Última Compra</label>
              <p className="font-medium">{client.lastPurchase || "Nunca"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Veículos Cadastrados</label>
              <p className="font-medium">{client.vehicles.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Car className="w-5 h-5 mr-2" />
            Veículos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {client.vehicles.map((vehicle) => (
              <div key={vehicle.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">
                    {vehicle.brand} {vehicle.model}
                  </h4>
                  <Badge variant="outline">{vehicle.year}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">Placa: {vehicle.plate}</p>
                <div className="text-sm">
                  <p>Pneus Dianteiros: {vehicle.frontTires || "Não informado"}</p>
                  <p>Pneus Traseiros: {vehicle.rearTires || "Não informado"}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// New Sale View
function NewSaleView({
  products,
  clients,
  onSave,
  onSaveBudget,
  onCancel,
}: {
  products: Product[]
  clients: Client[]
  onSave: (sale: Omit<Sale, "id">) => void
  onSaveBudget: (budget: Omit<Budget, "id">) => void
  onCancel: () => void
}) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [items, setItems] = useState<SaleItem[]>([])
  const [generalDiscount, setGeneralDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState("À Vista")
  const [searchProduct, setSearchProduct] = useState("")
  const [searchClient, setSearchClient] = useState("")

  const addItem = (product: Product) => {
    const existingItem = items.find((item) => item.productId === product.id)
    if (existingItem) {
      setItems(items.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      const newItem: SaleItem = {
        id: Date.now(),
        productId: product.id,
        product: `${product.brand} ${product.model}`,
        quantity: 1,
        unitPrice: product.price,
        discount: 0,
      }
      setItems([...items, newItem])
    }
    setSearchProduct("")
  }

  const updateItemDiscount = (id: number, discount: number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, discount } : item)))
  }

  const updateItemQuantity = (id: number, quantity: number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const subtotal = items.reduce((sum, item) => {
    const itemTotal = item.unitPrice * item.quantity - item.discount
    return sum + itemTotal
  }, 0)

  const total = subtotal - generalDiscount

  const filteredProducts = products.filter(
    (product) =>
      product.brand.toLowerCase().includes(searchProduct.toLowerCase()) ||
      product.model.toLowerCase().includes(searchProduct.toLowerCase()),
  )

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchClient.toLowerCase()) || client.document.includes(searchClient),
  )

  const handleSave = (asBudget = false) => {
    if (!selectedClient || items.length === 0) return

    const saleData = {
      clientId: selectedClient.id,
      client: selectedClient.name,
      items,
      subtotal,
      generalDiscount,
      total,
      date: new Date().toISOString().split("T")[0],
    }

    if (asBudget) {
      const budget: Omit<Budget, "id"> = {
        ...saleData,
        validity: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "Pendente",
      }
      onSaveBudget(budget)
    } else {
      const sale: Omit<Sale, "id"> = {
        ...saleData,
        payment: paymentMethod,
        status: "Pago",
      }
      onSave(sale)
    }
    onCancel()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nova Venda</h2>
          <p className="text-gray-600">Registre uma nova venda ou orçamento</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Dados da Venda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Client Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Cliente</label>
                <div className="space-y-2">
                  <Input
                    value={searchClient}
                    onChange={(e) => setSearchClient(e.target.value)}
                    placeholder="Buscar cliente por nome ou documento..."
                  />
                  {searchClient && (
                    <div className="border rounded-lg max-h-40 overflow-y-auto">
                      {filteredClients.map((client) => (
                        <button
                          key={client.id}
                          onClick={() => {
                            setSelectedClient(client)
                            setSearchClient("")
                          }}
                          className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0"
                        >
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-gray-600">
                            {client.document} - {client.phone}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedClient && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium">{selectedClient.name}</p>
                      <p className="text-sm text-gray-600">
                        {selectedClient.document} - {selectedClient.phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Adicionar Produtos</label>
                <div className="space-y-2">
                  <Input
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    placeholder="Buscar produtos..."
                  />
                  {searchProduct && (
                    <div className="border rounded-lg max-h-40 overflow-y-auto">
                      {filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => addItem(product)}
                          className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">
                                {product.brand} {product.model}
                              </p>
                              <p className="text-sm text-gray-600">
                                {product.size} - Estoque: {product.stock}
                              </p>
                            </div>
                            <p className="font-medium">R$ {product.price.toFixed(2)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-medium mb-3">Itens da Venda</h4>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h5 className="font-medium">{item.product}</h5>
                          <p className="text-sm text-gray-600">R$ {item.unitPrice.toFixed(2)} cada</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => removeItem(item.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Quantidade</label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Desconto</label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max={item.quantity * item.unitPrice}
                            value={item.discount}
                            onChange={(e) => updateItemDiscount(item.id, Number.parseFloat(e.target.value) || 0)}
                            placeholder="0,00"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Total</label>
                          <p className="p-2 bg-white border rounded font-medium">
                            R$ {(item.quantity * item.unitPrice - item.discount).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && <p className="text-gray-500 text-center py-8">Nenhum item adicionado</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumo da Venda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R$ {subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Desconto Geral:</span>
                <div className="flex items-center space-x-2">
                  <span>R$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max={subtotal}
                    value={generalDiscount}
                    onChange={(e) => setGeneralDiscount(Number.parseFloat(e.target.value) || 0)}
                    className="w-20"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Forma de Pagamento</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="À Vista">À Vista</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="PIX">PIX</option>
                  <option value="Crediário">Crediário</option>
                  <option value="Boleto">Boleto</option>
                </select>
              </div>

              {paymentMethod === "Crediário" && (
                <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">Opções de Parcelamento</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Primeira Parcela</label>
                      <Input type="date" className="w-full" min={new Date().toISOString().split("T")[0]} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Número de Parcelas</label>
                      <select className="w-full p-2 border border-gray-300 rounded-md">
                        <option value="2">2x</option>
                        <option value="3">3x</option>
                        <option value="4">4x</option>
                        <option value="5">5x</option>
                        <option value="6">6x</option>
                        <option value="10">10x</option>
                        <option value="12">12x</option>
                      </select>
                    </div>
                  </div>
                  <div className="text-sm text-blue-700">
                    <p>Valor da parcela: R$ {(total / 3).toFixed(2)} (exemplo para 3x)</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => handleSave(false)}
                  disabled={!selectedClient || items.length === 0}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Finalizar Venda
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSave(true)}
                  disabled={!selectedClient || items.length === 0}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Salvar Orçamento
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// View Budget View
function ViewBudgetView({
  budget,
  onConvert,
  onBack,
}: {
  budget: Budget
  onConvert: (budgetId: string) => void
  onBack: () => void
}) {
  return (
    <div className="space-y-6">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold text-gray-900">Orçamento #{budget.id}</DialogTitle>
            <p className="text-gray-600">{budget.client}</p>
          </div>
          <div className="space-x-2">
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button onClick={() => onConvert(budget.id)}>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Converter em Venda
            </Button>
          </div>
        </div>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Nome</label>
              <p className="font-medium">{budget.client}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Telefone</label>
              <p className="font-medium">(11) 99999-9999</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="font-medium">cliente@email.com</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados do Orçamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Data</label>
              <p className="font-medium">{budget.date}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Validade</label>
              <p className="font-medium">{budget.validity}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <Badge
                variant={
                  budget.status === "Aprovado" ? "default" : budget.status === "Convertido" ? "success" : "secondary"
                }
              >
                {budget.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Subtotal</label>
              <p className="font-medium">R$ {budget.subtotal.toFixed(2)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Desconto</label>
              <p className="font-medium">R$ {budget.generalDiscount.toFixed(2)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Total</label>
              <p className="font-bold text-lg text-green-600">R$ {budget.total.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Itens do Orçamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto/Serviço</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Valor Unit.</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budget.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>R$ {item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell>R$ {item.discount.toFixed(2)}</TableCell>
                    <TableCell>R$ {(item.quantity * item.unitPrice - item.discount).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Imprimir PDF
        </Button>
        <Button variant="outline">
          <Mail className="w-4 w-4 mr-2" />
          Enviar por Email
        </Button>
      </div>
    </div>
  )
}

// View Sale View
function ViewSaleView({ sale, onBack }: { sale: Sale; onBack: () => void }) {
  return (
    <div className="space-y-6">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold text-gray-900">Venda #{sale.id}</DialogTitle>
            <p className="text-gray-600">{sale.client}</p>
          </div>
          <div className="space-x-2">
            <Button variant="outline">
              <Receipt className="w-4 h-4 mr-2" />
              Imprimir Nota
            </Button>
            <Button variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Enviar por Email
            </Button>
          </div>
        </div>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Nome</label>
              <p className="font-medium">{sale.client}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Telefone</label>
              <p className="font-medium">(11) 99999-9999</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="font-medium">cliente@email.com</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dados da Venda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Data</label>
              <p className="font-medium">{sale.date}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Forma de Pagamento</label>
              <p className="font-medium">{sale.payment}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <Badge variant={sale.status === "Pago" ? "default" : "secondary"}>{sale.status}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Subtotal</label>
              <p className="font-medium">R$ {sale.subtotal.toFixed(2)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Desconto</label>
              <p className="font-medium">R$ {sale.generalDiscount.toFixed(2)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Total</label>
              <p className="font-bold text-lg text-green-600">R$ {sale.total.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Itens da Venda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto/Serviço</TableHead>
                  <TableHead>Qtd</TableHead>
                  <TableHead>Valor Unit.</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>R$ {item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell>R$ {item.discount.toFixed(2)}</TableCell>
                    <TableCell>R$ {(item.quantity * item.unitPrice - item.discount).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// View Installment View
function ViewInstallmentView({ installment, onBack }: { installment: Installment; onBack: () => void }) {
  return (
    <div className="space-y-6">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold text-gray-900">Crediário #{installment.id}</DialogTitle>
            <p className="text-gray-600">{installment.client}</p>
          </div>
          <div className="space-x-2">
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Renegociar
            </Button>
            <Button>
              <DollarSign className="w-4 h-4 mr-2" />
              Receber Parcela
            </Button>
          </div>
        </div>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Nome</label>
              <p className="font-medium">{installment.client}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Telefone</label>
              <p className="font-medium">(11) 99999-9999</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="font-medium">cliente@email.com</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo do Crediário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Total</label>
              <p className="font-medium">R$ {installment.totalValue.toFixed(2)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Pago</label>
              <p className="font-medium text-green-600">R$ {installment.paidValue.toFixed(2)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Restante</label>
              <p className="font-medium text-red-600">R$ {installment.remainingValue.toFixed(2)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Parcelas</label>
              <p className="font-medium">{installment.installments}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximo Vencimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-500">Data</label>
              <p className="font-medium">{installment.nextDue}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Valor</label>
              <p className="font-medium">R$ 200,00</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <Badge variant="destructive">Em Atraso</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Controle de Parcelas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parcela</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Pagamento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {installment.parcelas.map((parcela) => (
                  <TableRow key={parcela.numero}>
                    <TableCell>{parcela.numero}</TableCell>
                    <TableCell>R$ {parcela.valor.toFixed(2)}</TableCell>
                    <TableCell>{parcela.vencimento}</TableCell>
                    <TableCell>
                      <Badge variant={parcela.status === "Pago" ? "default" : "secondary"}>{parcela.status}</Badge>
                    </TableCell>
                    <TableCell>{parcela.dataPagamento || "-"}</TableCell>
                    <TableCell className="text-right">
                      {parcela.status === "Pendente" && (
                        <Button size="sm">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Receber
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Imprimir Carnê
        </Button>
        <Button variant="outline">
          <Mail className="w-4 h-4 mr-2" />
          Enviar por WhatsApp
        </Button>
      </div>
    </div>
  )
}

// Estoque Module
function EstoqueModule({
  products,
  onAddProduct,
  onEditProduct,
  onViewProduct,
  onDeleteProduct,
}: {
  products: Product[]
  onAddProduct: () => void
  onEditProduct: (product: Product) => void
  onViewProduct: (product: Product) => void
  onDeleteProduct: (id: string) => void
}) {
  const [activeTab, setActiveTab] = useState("produtos")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.size.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterType === "all" || product.type === filterType

    return matchesSearch && matchesFilter
  })

  const lowStockProducts = products.filter((p) => p.stock <= (p.minStock || 5))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestão de Estoque</h2>
          <p className="text-gray-600">Controle completo de produtos e movimentações</p>
        </div>
        <Button onClick={onAddProduct}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Produto
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="produtos">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle>Produtos Cadastrados ({filteredProducts.length})</CardTitle>
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="Buscar produtos..."
                      className="pl-8 w-full md:w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="all">Todos os tipos</option>
                    <option value="Pneu Novo">Pneu Novo</option>
                    <option value="Pneu Usado">Pneu Usado</option>
                    <option value="Pneu Remold">Pneu Remold</option>
                    <option value="Peças/Utensílios">Peças/Utensílios</option>
                    <option value="Serviço">Serviço</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Medida</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.type}</Badge>
                        </TableCell>
                        <TableCell>
                          {product.brand} {product.model}
                        </TableCell>
                        <TableCell>{product.size}</TableCell>
                        <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <span
                            className={
                              product.stock <= (product.minStock || 5)
                                ? "text-red-600 font-medium"
                                : "text-green-600 font-medium"
                            }
                          >
                            {product.stock} un
                          </span>
                          {product.condition && (
                            <span className="ml-2 text-gray-500">(Cond: {product.condition}/10)</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Abrir menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => onViewProduct(product)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onEditProduct(product)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Vender
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  if (confirm(`Tem certeza que deseja excluir ${product.brand} ${product.model}?`)) {
                                    onDeleteProduct(product.id)
                                  }
                                }}
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categorias">
          <CategoriesView products={products} />
        </TabsContent>

        <TabsContent value="movimentacoes">
          <MovimentacoesView />
        </TabsContent>

        <TabsContent value="alertas">
          <AlertasView products={lowStockProducts} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Categories View Component
function CategoriesView({ products }: { products: Product[] }) {
  const categories = products.reduce(
    (acc, product) => {
      const key = `${product.type} ${product.size}`
      if (!acc[key]) {
        acc[key] = {
          name: key,
          total: 0,
          new: 0,
          used: 0,
          remold: 0,
          avgPrice: 0,
          totalValue: 0,
        }
      }

      acc[key].total += product.stock
      acc[key].totalValue += product.price * product.stock

      if (product.type === "Pneu Novo") acc[key].new += product.stock
      else if (product.type === "Pneu Usado") acc[key].used += product.stock
      else if (product.type === "Pneu Remold") acc[key].remold += product.stock

      return acc
    },
    {} as Record<string, any>,
  )

  const categoryList = Object.values(categories).map((cat: any) => ({
    ...cat,
    avgPrice: cat.total > 0 ? cat.totalValue / cat.total : 0,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos Agrupados por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Novos</TableHead>
                <TableHead>Usados</TableHead>
                <TableHead>Remold</TableHead>
                <TableHead>Preço Médio</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryList.map((category, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.total}</TableCell>
                  <TableCell>{category.new}</TableCell>
                  <TableCell>{category.used}</TableCell>
                  <TableCell>{category.remold}</TableCell>
                  <TableCell>R$ {category.avgPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">
                      Ver Produtos
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// Movimentações View
function MovimentacoesView() {
  const movements = [
    {
      id: "M001",
      type: "Entrada",
      product: "Pneu Michelin 185/65R15",
      quantity: 10,
      date: "2024-01-15",
      reason: "Compra - Fornecedor ABC",
    },
    {
      id: "M002",
      type: "Saída",
      product: "Pneu Pirelli P7 185/65R15",
      quantity: 2,
      date: "2024-01-15",
      reason: "Venda - Cliente João Silva",
    },
    {
      id: "M003",
      type: "Ajuste",
      product: "Óleo Motor 5W30",
      quantity: -1,
      date: "2024-01-14",
      reason: "Perda - Vazamento",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Movimentações de Estoque</CardTitle>
        <CardDescription>Histórico de entradas e saídas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Motivo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="font-medium">{movement.id}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        movement.type === "Entrada"
                          ? "default"
                          : movement.type === "Saída"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {movement.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{movement.product}</TableCell>
                  <TableCell className={movement.quantity > 0 ? "text-green-600" : "text-red-600"}>
                    {movement.quantity > 0 ? "+" : ""}
                    {movement.quantity}
                  </TableCell>
                  <TableCell>{movement.date}</TableCell>
                  <TableCell>{movement.reason}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// Alertas View
function AlertasView({ products }: { products: Product[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas do Sistema</CardTitle>
        <CardDescription>Produtos que precisam de atenção</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Estoque Atual</TableHead>
                <TableHead>Estoque Mínimo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Badge variant={product.stock <= 2 ? "destructive" : "secondary"}>
                      {product.stock <= 2 ? "Estoque Crítico" : "Estoque Baixo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {product.brand} {product.model}
                  </TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>{product.minStock || 5}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">
                      Comprar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// Relatórios Clientes View
function RelatoriosClientesView({ clients }: { clients: Client[] }) {
  const totalSpent = clients.reduce((sum, client) => sum + client.totalSpent, 0)
  const avgSpent = clients.length > 0 ? totalSpent / clients.length : 0
  const topClients = clients.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 3)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total de Clientes:</span>
              <span className="font-medium">{clients.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Gasto Total:</span>
              <span className="font-medium text-green-600">R$ {totalSpent.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Gasto Médio:</span>
              <span className="font-medium">R$ {avgSpent.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clientes Mais Rentáveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topClients.map((client, index) => (
              <div key={client.id} className="flex justify-between">
                <span>{client.name}</span>
                <span className="font-medium">R$ {client.totalSpent.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ticket Médio por Segmento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Pessoa Física:</span>
              <span className="font-medium">R$ 285,00</span>
            </div>
            <div className="flex justify-between">
              <span>Pessoa Jurídica:</span>
              <span className="font-medium">R$ 1.450,00</span>
            </div>
            <div className="flex justify-between">
              <span>Frotas:</span>
              <span className="font-medium">R$ 3.200,00</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Análise de Veículos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total de Veículos:</span>
              <span className="font-medium">{clients.reduce((sum, client) => sum + client.vehicles.length, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Veículos por Cliente:</span>
              <span className="font-medium">
                {(clients.reduce((sum, client) => sum + client.vehicles.length, 0) / clients.length).toFixed(1)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Relatórios Estoque View
function RelatoriosEstoqueView({ products }: { products: Product[] }) {
  const totalValue = products.reduce((sum, product) => sum + product.price * product.stock, 0)
  const totalCost = products.reduce((sum, product) => sum + (product.costPrice || 0) * product.stock, 0)
  const lowStockCount = products.filter((p) => p.stock <= (p.minStock || 5)).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Valorização do Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Valor de Custo:</span>
              <span className="font-medium">R$ {totalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Valor de Venda:</span>
              <span className="font-medium text-green-600">R$ {totalValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Margem Potencial:</span>
              <span className="font-medium">R$ {(totalValue - totalCost).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Clientes Module
function ClientesModule({
  clients,
  onAddClient,
  onEditClient,
  onViewClient,
  onDeleteClient,
}: {
  clients: Client[]
  onAddClient: () => void
  onEditClient: (client: Client) => void
  onViewClient: (client: Client) => void
  onDeleteClient: (id: string) => void
}) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.document.includes(searchTerm) ||
      client.phone.includes(searchTerm),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestão de Clientes</h2>
          <p className="text-gray-600">Controle completo de clientes e frotas</p>
        </div>
        <Button onClick={onAddClient}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Lista de Clientes ({filteredClients.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Buscar clientes..."
                className="pl-8 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome/Razão Social</TableHead>
                  <TableHead>CPF/CNPJ</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Veículos</TableHead>
                  <TableHead>Última Compra</TableHead>
                  <TableHead>Total Gasto</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.id}</TableCell>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{client.document}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>{client.vehicles.length}</TableCell>
                    <TableCell>{client.lastPurchase || "Nunca"}</TableCell>
                    <TableCell className="font-medium text-green-600">R$ {client.totalSpent.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onViewClient(client)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditClient(client)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Nova Venda
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Veículo
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja excluir ${client.name}?`)) {
                                onDeleteClient(client.id)
                              }
                            }}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Vendas Module
function VendasModule({
  sales,
  budgets,
  installments,
  onNewSale,
  onViewBudget,
  onViewSale,
  onViewInstallment,
  onConvertBudget,
}: {
  sales: Sale[]
  budgets: Budget[]
  installments: Installment[]
  onNewSale: () => void
  onViewBudget: (budget: Budget) => void
  onViewSale: (sale: Sale) => void
  onViewInstallment: (installment: Installment) => void
  onConvertBudget: (budgetId: string) => void
}) {
  const [activeTab, setActiveTab] = useState("nova-venda")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sistema de Vendas</h2>
        <p className="text-gray-600">Gestão completa de vendas e orçamentos</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="nova-venda">Nova Venda</TabsTrigger>
          <TabsTrigger value="orcamentos">Orçamentos</TabsTrigger>
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="crediario">Crediário</TabsTrigger>
        </TabsList>

        <TabsContent value="nova-venda">
          <Card>
            <CardHeader>
              <CardTitle>Iniciar Nova Venda</CardTitle>
              <CardDescription>Clique no botão abaixo para iniciar uma nova venda ou orçamento</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={onNewSale} size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Nova Venda/Orçamento
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orcamentos">
          <OrcamentosView budgets={budgets} onViewBudget={onViewBudget} onConvertBudget={onConvertBudget} />
        </TabsContent>

        <TabsContent value="vendas">
          <VendasView sales={sales} onViewSale={onViewSale} />
        </TabsContent>

        <TabsContent value="crediario">
          <CrediarioView installments={installments} onViewInstallment={onViewInstallment} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Orçamentos View
function OrcamentosView({
  budgets,
  onViewBudget,
  onConvertBudget,
}: {
  budgets: Budget[]
  onViewBudget: (budget: Budget) => void
  onConvertBudget: (budgetId: string) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Orçamentos</CardTitle>
        <CardDescription>Lista de orçamentos pendentes e aprovados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell className="font-medium">{budget.id}</TableCell>
                  <TableCell>{budget.client}</TableCell>
                  <TableCell>{budget.date}</TableCell>
                  <TableCell>{budget.validity}</TableCell>
                  <TableCell className="font-medium">R$ {budget.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        budget.status === "Aprovado"
                          ? "default"
                          : budget.status === "Convertido"
                            ? "success"
                            : "secondary"
                      }
                    >
                      {budget.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button size="sm" variant="outline" onClick={() => onViewBudget(budget)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      {budget.status !== "Convertido" && (
                        <Button size="sm" onClick={() => onConvertBudget(budget.id)}>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Converter
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// Vendas View
function VendasView({ sales, onViewSale }: { sales: Sale[]; onViewSale: (sale: Sale) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas Realizadas</CardTitle>
        <CardDescription>Histórico de vendas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.id}</TableCell>
                  <TableCell>{sale.client}</TableCell>
                  <TableCell>{sale.date}</TableCell>
                  <TableCell>{sale.payment}</TableCell>
                  <TableCell className="font-medium">R$ {sale.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={sale.status === "Pago" ? "default" : "secondary"}>{sale.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button size="sm" variant="outline" onClick={() => onViewSale(sale)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                      <Button size="sm" variant="outline">
                        <Receipt className="h-4 w-4 mr-2" />
                        Imprimir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// Crediário View
function CrediarioView({
  installments,
  onViewInstallment,
}: {
  installments: Installment[]
  onViewInstallment: (installment: Installment) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Controle de Crediário</CardTitle>
        <CardDescription>Vendas a prazo e parcelas em aberto</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Restante</TableHead>
                <TableHead>Parcelas</TableHead>
                <TableHead>Próximo Venc.</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {installments.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.client}</TableCell>
                  <TableCell>R$ {item.totalValue.toFixed(2)}</TableCell>
                  <TableCell className="text-green-600">R$ {item.paidValue.toFixed(2)}</TableCell>
                  <TableCell className="text-red-600">R$ {item.remainingValue.toFixed(2)}</TableCell>
                  <TableCell>{item.installments}</TableCell>
                  <TableCell>{item.nextDue}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button size="sm" variant="outline" onClick={() => onViewInstallment(item)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Detalhes
                      </Button>
                      <Button size="sm">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Receber
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// Financeiro Module
function FinanceiroModule() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestão Financeira</h2>
        <p className="text-gray-600">Controle de contas a receber, pagar e fluxo de caixa</p>
      </div>

      <Tabs defaultValue="receber" className="w-full">
        <TabsList>
          <TabsTrigger value="receber">Contas a Receber</TabsTrigger>
          <TabsTrigger value="pagar">Contas a Pagar</TabsTrigger>
          <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="receber">
          <ContasReceberView />
        </TabsContent>

        <TabsContent value="pagar">
          <ContasPagarView />
        </TabsContent>

        <TabsContent value="fluxo">
          <FluxoCaixaView />
        </TabsContent>

        <TabsContent value="relatorios">
          <RelatoriosFinanceiroView />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Contas a Receber View
function ContasReceberView() {
  const contasReceber = [
    {
      id: "CR001",
      client: "João Silva",
      value: "R$ 200,00",
      dueDate: "2024-01-20",
      status: "Em Atraso",
      days: 5,
    },
    {
      id: "CR002",
      client: "Maria Santos",
      value: "R$ 400,00",
      dueDate: "2024-01-25",
      status: "A Vencer",
      days: 10,
    },
    {
      id: "CR003",
      client: "Pedro Costa",
      value: "R$ 150,00",
      dueDate: "2024-01-18",
      status: "Em Atraso",
      days: 7,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contas a Receber</CardTitle>
        <CardDescription>Parcelas e pagamentos pendentes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dias</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contasReceber.map((conta) => (
                <TableRow key={conta.id}>
                  <TableCell className="font-medium">{conta.id}</TableCell>
                  <TableCell>{conta.client}</TableCell>
                  <TableCell>{conta.value}</TableCell>
                  <TableCell>{conta.dueDate}</TableCell>
                  <TableCell>
                    <Badge variant={conta.status === "Em Atraso" ? "destructive" : "secondary"}>{conta.status}</Badge>
                  </TableCell>
                  <TableCell>{conta.days}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Negociar
                      </Button>
                      <Button size="sm">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Receber
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// Contas a Pagar View
function ContasPagarView() {
  const contasPagar = [
    {
      id: "CP001",
      supplier: "Fornecedor ABC",
      value: "R$ 5.000,00",
      dueDate: "2024-01-22",
      category: "Compra de Mercadorias",
    },
    {
      id: "CP002",
      supplier: "Energia Elétrica",
      value: "R$ 450,00",
      dueDate: "2024-01-28",
      category: "Despesas Operacionais",
    },
    {
      id: "CP003",
      supplier: "Aluguel",
      value: "R$ 2.800,00",
      dueDate: "2024-01-30",
      category: "Despesas Fixas",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contas a Pagar</CardTitle>
        <CardDescription>Compromissos financeiros pendentes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contasPagar.map((conta) => (
                <TableRow key={conta.id}>
                  <TableCell className="font-medium">{conta.id}</TableCell>
                  <TableCell>{conta.supplier}</TableCell>
                  <TableCell>{conta.category}</TableCell>
                  <TableCell>{conta.value}</TableCell>
                  <TableCell>{conta.dueDate}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button size="sm">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Pagar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// Fluxo de Caixa View
function FluxoCaixaView() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Entradas Previstas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Hoje:</span>
              <span className="font-medium text-green-600">R$ 1.200,00</span>
            </div>
            <div className="flex justify-between">
              <span>Esta Semana:</span>
              <span className="font-medium text-green-600">R$ 3.450,00</span>
            </div>
            <div className="flex justify-between">
              <span>Este Mês:</span>
              <span className="font-medium text-green-600">R$ 15.800,00</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saídas Previstas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Hoje:</span>
              <span className="font-medium text-red-600">R$ 800,00</span>
            </div>
            <div className="flex justify-between">
              <span>Esta Semana:</span>
              <span className="font-medium text-red-600">R$ 2.100,00</span>
            </div>
            <div className="flex justify-between">
              <span>Este Mês:</span>
              <span className="font-medium text-red-600">R$ 8.900,00</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Saldo Projetado</CardHeader>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-lg">
              <span>Saldo Atual:</span>
              <span className="font-bold text-blue-600">R$ 12.450,00</span>
            </div>
            <div className="flex justify-between">
              <span>Projeção 7 dias:</span>
              <span className="font-medium text-green-600">R$ 13.900,00</span>
            </div>
            <div className="flex justify-between">
              <span>Projeção 30 dias:</span>
              <span className="font-medium text-green-600">R$ 19.350,00</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Relatórios Financeiro View
function RelatoriosFinanceiroView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>DRE Simplificado</CardTitle>
          <CardDescription>Demonstrativo do mês atual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Receita Bruta:</span>
              <span className="font-medium">R$ 45.000,00</span>
            </div>
            <div className="flex justify-between">
              <span>(-) Impostos:</span>
              <span className="font-medium text-red-600">R$ 3.600,00</span>
            </div>
            <div className="flex justify-between">
              <span>Receita Líquida:</span>
              <span className="font-medium">R$ 41.400,00</span>
            </div>
            <div className="flex justify-between">
              <span>(-) Custos:</span>
              <span className="font-medium text-red-600">R$ 28.000,00</span>
            </div>
            <div className="flex justify-between">
              <span>(-) Despesas:</span>
              <span className="font-medium text-red-600">R$ 8.500,00</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Lucro Líquido:</span>
              <span className="text-green-600">R$ 4.900,00</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Indicadores</CardTitle>
          <CardDescription>Métricas importantes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Margem Bruta:</span>
              <span className="font-medium">29.8%</span>
            </div>
            <div className="flex justify-between">
              <span>Margem Líquida:</span>
              <span className="font-medium">10.9%</span>
            </div>
            <div className="flex justify-between">
              <span>Ticket Médio:</span>
              <span className="font-medium">R$ 285,00</span>
            </div>
            <div className="flex justify-between">
              <span>Inadimplência:</span>
              <span className="font-medium text-red-600">3.2%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Serviços Module
function ServicosModule() {
  const [activeTab, setActiveTab] = useState("agenda")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestão de Serviços</h2>
        <p className="text-gray-600">Ordens de serviço, agendamentos e controle de execução</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="agenda">Agenda</TabsTrigger>
          <TabsTrigger value="ordens">Ordens de Serviço</TabsTrigger>
          <TabsTrigger value="novo-agendamento">Novo Agendamento</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="agenda">
          <AgendaView />
        </TabsContent>

        <TabsContent value="ordens">
          <OrdensServicoView />
        </TabsContent>

        <TabsContent value="novo-agendamento">
          <NovoAgendamentoForm />
        </TabsContent>

        <TabsContent value="historico">
          <HistoricoServicosView />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Agenda View
function AgendaView() {
  const agendamentos = [
    {
      id: "A001",
      time: "08:00",
      client: "João Silva",
      service: "Alinhamento + Balanceamento",
      vehicle: "Honda Civic - ABC-1234",
      status: "Agendado",
    },
    {
      id: "A002",
      time: "10:30",
      client: "Transportadora ABC",
      service: "Troca de 4 Pneus",
      vehicle: "Mercedes Sprinter - XYZ-5678",
      status: "Em Andamento",
    },
    {
      id: "A003",
      time: "14:00",
      client: "Maria Santos",
      service: "Revisão Completa",
      vehicle: "Toyota Corolla - DEF-9012",
      status: "Agendado",
    },
    {
      id: "A004",
      time: "16:30",
      client: "Carlos Mendes",
      service: "Troca de Óleo",
      vehicle: "Fiat Uno - GHI-3456",
      status: "Agendado",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Agenda de Hoje - {new Date().toLocaleDateString("pt-BR")}</CardTitle>
            <CardDescription>Serviços agendados para hoje</CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Horário</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agendamentos.map((agendamento) => (
                <TableRow key={agendamento.id}>
                  <TableCell className="font-medium">{agendamento.time}</TableCell>
                  <TableCell>{agendamento.client}</TableCell>
                  <TableCell>{agendamento.service}</TableCell>
                  <TableCell>{agendamento.vehicle}</TableCell>
                  <TableCell>
                    <Badge variant={agendamento.status === "Em Andamento" ? "default" : "outline"}>
                      {agendamento.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button size="sm">
                        <Wrench className="h-4 w-4 mr-2" />
                        {agendamento.status === "Em Andamento" ? "Finalizar" : "Iniciar"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// Ordens de Serviço View
function OrdensServicoView() {
  const ordens = [
    {
      id: "OS001",
      client: "João Silva",
      vehicle: "Honda Civic - ABC-1234",
      services: ["Alinhamento", "Balanceamento"],
      status: "Em Andamento",
      total: "R$ 120,00",
    },
    {
      id: "OS002",
      client: "Maria Santos",
      vehicle: "Toyota Corolla - DEF-9012",
      services: ["Troca de Óleo", "Filtro de Ar"],
      status: "Aguardando Peças",
      total: "R$ 85,00",
    },
    {
      id: "OS003",
      client: "Transportadora ABC",
      vehicle: "Mercedes Sprinter - XYZ-5678",
      services: ["Troca de 4 Pneus", "Alinhamento"],
      status: "Concluído",
      total: "R$ 1.450,00",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Ordens de Serviço</CardTitle>
            <CardDescription>Controle de execução dos serviços</CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova OS
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Serviços</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordens.map((ordem) => (
                <TableRow key={ordem.id}>
                  <TableCell className="font-medium">{ordem.id}</TableCell>
                  <TableCell>{ordem.client}</TableCell>
                  <TableCell>{ordem.vehicle}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {ordem.services.map((service, index) => (
                        <Badge key={index} variant="outline">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{ordem.total}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        ordem.status === "Em Andamento"
                          ? "default"
                          : ordem.status === "Concluído"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {ordem.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Detalhes
                      </Button>
                      <Button size="sm">
                        <Wrench className="h-4 w-4 mr-2" />
                        {ordem.status === "Concluído" ? "Imprimir" : "Finalizar"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// Novo Agendamento Form
function NovoAgendamentoForm() {
  const [formData, setFormData] = useState({
    client: "",
    vehicle: "",
    date: "",
    time: "",
    services: [] as string[],
    observations: "",
  })

  const handleServiceChange = (service: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, services: [...formData.services, service] })
    } else {
      setFormData({ ...formData, services: formData.services.filter((s) => s !== service) })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    alert("Agendamento criado com sucesso!")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Agendamento</CardTitle>
        <CardDescription>Agendar serviço para cliente</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Cliente</label>
              <Input
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                placeholder="Buscar cliente..."
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Veículo</label>
              <select
                value={formData.vehicle}
                onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Selecione o veículo</option>
                <option value="Honda Civic - ABC-1234">Honda Civic - ABC-1234</option>
                <option value="Toyota Corolla - DEF-9012">Toyota Corolla - DEF-9012</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Data</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Horário</label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Serviços</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {["Alinhamento", "Balanceamento", "Troca de Óleo", "Troca de Pneus", "Revisão Geral", "Vulcanização"].map(
                (service) => (
                  <label key={service} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={formData.services.includes(service)}
                      onChange={(e) => handleServiceChange(service, e.target.checked)}
                    />
                    <span className="text-sm">{service}</span>
                  </label>
                ),
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Observações</label>
            <textarea
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
              placeholder="Observações sobre o serviço..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
            <Button type="submit">
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Serviço
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Histórico de Serviços View
function HistoricoServicosView() {
  const historico = [
    {
      id: "HS001",
      date: "2024-01-10",
      client: "João Silva",
      vehicle: "Honda Civic - ABC-1234",
      services: ["Alinhamento", "Balanceamento"],
      total: "R$ 120,00",
    },
    {
      id: "HS002",
      date: "2024-01-08",
      client: "Transportadora ABC",
      vehicle: "Mercedes Sprinter - XYZ-5678",
      services: ["Troca de 4 Pneus"],
      total: "R$ 1.200,00",
    },
    {
      id: "HS003",
      date: "2024-01-05",
      client: "Maria Santos",
      vehicle: "Toyota Corolla - DEF-9012",
      services: ["Revisão Completa"],
      total: "R$ 350,00",
    },
    {
      id: "HS004",
      date: "2024-01-03",
      client: "Carlos Mendes",
      vehicle: "Fiat Uno - GHI-3456",
      services: ["Troca de Óleo", "Filtro de Ar"],
      total: "R$ 95,00",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Histórico de Serviços</CardTitle>
            <CardDescription>Serviços realizados</CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input type="text" placeholder="Buscar serviços..." className="pl-8 w-full md:w-64" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Serviços</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historico.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.date}</TableCell>
                  <TableCell className="font-medium">{item.client}</TableCell>
                  <TableCell>{item.vehicle}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.services.map((service, index) => (
                        <Badge key={index} variant="outline">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{item.total}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

// Relatórios Module
function RelatoriosModule({
  products,
  clients,
  sales,
}: {
  products: Product[]
  clients: Client[]
  sales: Sale[]
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Relatórios e Analytics</h2>
        <p className="text-gray-600">Análises e relatórios gerenciais</p>
      </div>

      <Tabs defaultValue="vendas" className="w-full">
        <TabsList>
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="vendas">
          <RelatoriosVendasView sales={sales} />
        </TabsContent>

        <TabsContent value="estoque">
          <RelatoriosEstoqueView products={products} />
        </TabsContent>

        <TabsContent value="clientes">
          <RelatoriosClientesView clients={clients} />
        </TabsContent>

        <TabsContent value="financeiro">
          <RelatoriosFinanceiroView />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Relatórios Vendas View
function RelatoriosVendasView({ sales }: { sales: Sale[] }) {
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0)
  const avgSale = sales.length > 0 ? totalSales / sales.length : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total de Vendas:</span>
              <span className="font-medium">{sales.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Faturado:</span>
              <span className="font-medium text-green-600">R$ {totalSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Ticket Médio:</span>
              <span className="font-medium">R$ {avgSale.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Formas de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>À Vista:</span>
              <span className="font-medium">45%</span>
            </div>
            <div className="flex justify-between">
              <span>Cartão de Crédito:</span>
              <span className="font-medium">30%</span>
            </div>
            <div className="flex justify-between">
              <span>PIX:</span>
              <span className="font-medium">15%</span>
            </div>
            <div className="flex justify-between">
              <span>Boleto:</span>
              <span className="font-medium">10%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Produtos Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Pneu Michelin 185/65R15:</span>
              <span className="font-medium">120 un</span>
            </div>
            <div className="flex justify-between">
              <span>Bateria Moura 60Ah:</span>
              <span className="font-medium">85 un</span>
            </div>
            <div className="flex justify-between">
              <span>Óleo Motor 5W30:</span>
              <span className="font-medium">70 un</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vendas por Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Hoje:</span>
              <span className="font-medium text-green-600">R$ 1.200,00</span>
            </div>
            <div className="flex justify-between">
              <span>Esta Semana:</span>
              <span className="font-medium text-green-600">R$ 5.450,00</span>
            </div>
            <div className="flex justify-between">
              <span>Este Mês:</span>
              <span className="font-medium text-green-600">R$ 22.800,00</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
