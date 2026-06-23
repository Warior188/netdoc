from typing import List
from app.schemas.schemas import AddressEntryOut, DeviceOut, DeviceType


INTERFACE_DEFAULTS = {
    DeviceType.router: "GigabitEthernet0/",
    DeviceType.switch: "FastEthernet0/",
    DeviceType.pc: "Ethernet0",
    DeviceType.server: "eth0",
    DeviceType.firewall: "GigabitEthernet0/",
}


def generate_router_config(device: DeviceOut, entries: List[AddressEntryOut]) -> str:
    lines = [
        f"! {'='*52}",
        f"! Urzadzenie  : {device.name}",
        f"! Typ         : Router Cisco IOS",
        f"! Wygenerowano: NetDoc Maker v1.0",
        f"! {'='*52}",
        "",
        "enable",
        "configure terminal",
        "",
        f"hostname {device.name}",
        "",
        "! --- Bezpieczenstwo ---",
        "enable secret cisco123",
        "no ip domain-lookup",
        "service password-encryption",
        "",
        "line console 0",
        " password cisco",
        " login",
        " logging synchronous",
        "line vty 0 4",
        " password cisco",
        " login",
        " transport input ssh telnet",
        "",
        "! --- Interfejsy ---",
    ]

    for i, entry in enumerate(entries):
        if not entry.ip_address:
            continue
        lines += [
            f"interface {entry.interface}",
            f" description {entry.description or f'Link-{device.name}-if{i}'}",
            f" ip address {entry.ip_address} {entry.subnet_mask}",
            " no shutdown",
            "!",
        ]

    lines += [
        "",
        "! --- Routing (uzupelnic wg projektu) ---",
        "! ip route 0.0.0.0 0.0.0.0 [next-hop-ip]",
        "! router ospf 1",
        "!  router-id [X.X.X.X]",
        "!  network 0.0.0.0 255.255.255.255 area 0",
        "",
        "! --- SSH ---",
        "ip domain-name netdoc.local",
        "crypto key generate rsa modulus 2048",
        "ip ssh version 2",
        "",
        f"banner motd #",
        f" Unauthorized access to {device.name} is prohibited!",
        "#",
        "",
        "end",
        "write memory",
    ]
    return "\n".join(lines)


def generate_switch_config(device: DeviceOut, entries: List[AddressEntryOut]) -> str:
    lines = [
        f"! {'='*52}",
        f"! Urzadzenie  : {device.name}",
        f"! Typ         : Switch Cisco IOS",
        f"! Wygenerowano: NetDoc Maker v1.0",
        f"! {'='*52}",
        "",
        "enable",
        "configure terminal",
        "",
        f"hostname {device.name}",
        "",
        "! --- Bezpieczenstwo ---",
        "enable secret cisco123",
        "no ip domain-lookup",
        "service password-encryption",
        "",
        "line console 0",
        " password cisco",
        " login",
        " logging synchronous",
        "line vty 0 15",
        " password cisco",
        " login",
        "",
        "! --- VLANy ---",
        "vlan 10",
        " name DATA",
        "vlan 20",
        " name MGMT",
        "vlan 99",
        " name NATIVE",
        "!",
    ]

    mgmt = next((e for e in entries if e.ip_address), None)
    if mgmt:
        lines += [
            "! --- Interfejs zarzadzania ---",
            "interface Vlan1",
            f" ip address {mgmt.ip_address} {mgmt.subnet_mask}",
            " no shutdown",
            "!",
        ]
        if mgmt.gateway:
            lines.append(f"ip default-gateway {mgmt.gateway}")
            lines.append("!")

    lines += [
        "",
        "! --- Porty dostepowe (uzupelnic) ---",
        "! interface range FastEthernet0/1 - 12",
        "!  switchport mode access",
        "!  switchport access vlan 10",
        "!  spanning-tree portfast",
        "",
        "! --- Port trunk (uzupelnic) ---",
        "! interface GigabitEthernet0/1",
        "!  switchport mode trunk",
        "!  switchport trunk native vlan 99",
        "!  switchport trunk allowed vlan 10,20",
        "",
        f"banner motd # {device.name} - Dostep tylko dla uprawnionych! #",
        "",
        "end",
        "write memory",
    ]
    return "\n".join(lines)


def generate_firewall_config(device: DeviceOut, entries: List[AddressEntryOut]) -> str:
    lines = [
        f"! {'='*52}",
        f"! Urzadzenie  : {device.name}",
        f"! Typ         : Firewall (Cisco ASA)",
        f"! Wygenerowano: NetDoc Maker v1.0",
        f"! {'='*52}",
        "",
        "enable",
        "configure terminal",
        "",
        f"hostname {device.name}",
        "",
        "! --- Interfejsy stref bezpieczenstwa ---",
    ]

    for i, entry in enumerate(entries):
        if not entry.ip_address:
            continue
        sec_level = 100 if i == 0 else 0
        nameif = "inside" if i == 0 else "outside" if i == 1 else f"dmz{i}"
        lines += [
            f"interface {entry.interface}",
            f" nameif {nameif}",
            f" security-level {sec_level}",
            f" ip address {entry.ip_address} {entry.subnet_mask}",
            " no shutdown",
            "!",
        ]

    lines += [
        "",
        "! --- NAT (uzupelnic) ---",
        "! object network INSIDE_NET",
        "!  subnet 192.168.1.0 255.255.255.0",
        "!  nat (inside,outside) dynamic interface",
        "",
        "! --- Polityki dostepu (uzupelnic) ---",
        "! access-list OUTSIDE_IN extended permit tcp any any eq 443",
        "! access-group OUTSIDE_IN in interface outside",
        "",
        "! --- Inspekcja ---",
        "policy-map global_policy",
        " class inspection_default",
        "  inspect icmp",
        "  inspect ftp",
        "  inspect http",
        "service-policy global_policy global",
        "",
        "end",
        "write memory",
    ]
    return "\n".join(lines)


def generate_host_config(device: DeviceOut, entries: List[AddressEntryOut]) -> str:
    entry = entries[0] if entries else None
    ip = entry.ip_address if entry else "X.X.X.X"
    mask = entry.subnet_mask if entry else "255.255.255.0"
    gw = entry.gateway if entry else "GW"
    iface = entry.interface if entry else "eth0"

    lines = [
        f"! {'='*52}",
        f"! Host        : {device.name}",
        f"! Typ         : {device.device_type.value.upper()}",
        f"! Wygenerowano: NetDoc Maker v1.0",
        f"! {'='*52}",
        "",
        f"! Adres IP  : {ip}",
        f"! Maska     : {mask}",
        f"! Brama     : {gw}",
        f"! Interfejs : {iface}",
        "",
        "! === Linux ===",
        f"ip addr add {ip}/{mask} dev {iface}",
        f"ip route add default via {gw}",
        f"ip link set {iface} up",
        "",
        "! === Windows (cmd jako admin) ===",
        f"netsh interface ip set address \"{iface}\" static {ip} {mask} {gw}",
        "",
        "! === Weryfikacja ===",
        f"ping {gw}",
        "traceroute 8.8.8.8",
        "ip addr show",
    ]
    return "\n".join(lines)


def generate_config(device: DeviceOut, entries: List[AddressEntryOut]) -> str:
    dev_entries = [e for e in entries if e.device_name == device.name]

    generators = {
        DeviceType.router: generate_router_config,
        DeviceType.switch: generate_switch_config,
        DeviceType.firewall: generate_firewall_config,
        DeviceType.pc: generate_host_config,
        DeviceType.server: generate_host_config,
    }

    gen_fn = generators.get(device.device_type, generate_host_config)
    return gen_fn(device, dev_entries)