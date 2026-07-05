import { ChevronRight } from 'lucide-react'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from '@/components/ui/sidebar'

import { NavLink, useLocation } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'


export function NavGroup({ title, items }) {
    const { state, isMobile } = useSidebar()

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{title}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const key = `${item.title}-${item.url}`

                    if (!item.items)
                        return <SidebarMenuLink key={key} item={item} />

                    if (state === 'collapsed' && !isMobile)
                        return <SidebarMenuCollapsedDropdown key={key} item={item} />

                    return <SidebarMenuCollapsible key={key} item={item} />
                })}
            </SidebarMenu>
        </SidebarGroup>
    )
}

function NavBadge({ children }) {
    return <Badge className='rounded-full px-1 py-0 text-xs'>{children}</Badge>
}


function SidebarMenuLink({ item }) {
    const { setOpenMobile } = useSidebar()

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={item.title}>
                <NavLink
                    to={item.url}
                    end
                    onClick={() => setOpenMobile(false)}
                    className={({ isActive }) => isActive ? 'data-[active=true]' : ''}
                >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {item.badge && <NavBadge>{item.badge}</NavBadge>}
                </NavLink>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}


function SidebarMenuCollapsible({ item }) {
    const { setOpenMobile } = useSidebar()
    const location = useLocation()

    const isParentActive = item.items?.some((sub) =>
        location.pathname.startsWith(sub.url)
    )

    return (
        <Collapsible asChild defaultOpen={isParentActive} className='group/collapsible'>
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        {item.badge && <NavBadge>{item.badge}</NavBadge>}
                        <ChevronRight className='ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 rtl:rotate-180' />
                    </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <SidebarMenuSub>
                        {item.items.map((sub) => (
                            <SidebarMenuSubItem key={sub.title}>
                                <SidebarMenuSubButton asChild>
                                    <NavLink
                                        to={sub.url}
                                        onClick={() => setOpenMobile(false)}
                                        className={({ isActive }) => isActive ? 'data-[active=true]' : ''}
                                    >
                                        {sub.icon && <sub.icon />}
                                        <span>{sub.title}</span>
                                        {sub.badge && <NavBadge>{sub.badge}</NavBadge>}
                                    </NavLink>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    )
}


function SidebarMenuCollapsedDropdown({ item }) {
    const location = useLocation()
    const isParentActive = item.items?.some((sub) =>
        location.pathname.startsWith(sub.url)
    )

    return (
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} data-active={isParentActive}>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                        {item.badge && <NavBadge>{item.badge}</NavBadge>}
                        <ChevronRight className='ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent side='right' align='start' sideOffset={4}>
                    <DropdownMenuLabel>
                        {item.title} {item.badge ? `(${item.badge})` : ''}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {item.items.map((sub) => (
                        <DropdownMenuItem key={`${sub.title}-${sub.url}`} asChild>
                            <NavLink
                                to={sub.url}
                                className={({ isActive }) => isActive ? 'bg-secondary' : ''}
                            >
                                {sub.icon && <sub.icon />}
                                <span className='max-w-52 text-wrap'>{sub.title}</span>
                                {sub.badge && (
                                    <span className='ms-auto text-xs'>{sub.badge}</span>
                                )}
                            </NavLink>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    )
}
