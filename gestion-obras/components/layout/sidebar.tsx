"use client"

import { Fragment } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Dialog, Transition } from "@headlessui/react"
import {
  XMarkIcon,
  HomeIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CogIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Obras", href: "/obras", icon: BuildingOfficeIcon },
  { name: "Planes", href: "/planes", icon: DocumentTextIcon },
  { name: "Riesgos", href: "/riesgos", icon: ExclamationTriangleIcon },
  { name: "Reportes", href: "/reportes", icon: ChartBarIcon },
]

const administracion = [
  { name: "Departamentos", href: "/administracion/departamentos" },
  { name: "Localidades", href: "/administracion/localidades" },
  { name: "Estados de Obra", href: "/administracion/estados-obra" },
  { name: "Rubros", href: "/administracion/rubros" },
]

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname()

  const SidebarContent = () => (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 ring-1 ring-gray-900/10">
      <div className="flex h-16 shrink-0 items-center">
        <h1 className="text-xl font-bold text-gray-900">Gestión de Obras</h1>
      </div>

      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      pathname === item.href
                        ? "bg-gray-50 text-blue-600"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50",
                      "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold",
                    )}
                  >
                    <item.icon
                      className={cn(
                        pathname === item.href ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600",
                        "h-6 w-6 shrink-0",
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>

          <li>
            <div className="text-xs font-semibold leading-6 text-gray-400">Administración</div>
            <ul role="list" className="-mx-2 mt-2 space-y-1">
              {administracion.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      pathname === item.href
                        ? "bg-gray-50 text-blue-600"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50",
                      "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold",
                    )}
                  >
                    <CogIcon
                      className={cn(
                        pathname === item.href ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600",
                        "h-6 w-6 shrink-0",
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  )

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" className="-m-2.5 p-2.5" onClick={() => setOpen(false)}>
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent />
      </div>
    </>
  )
}
