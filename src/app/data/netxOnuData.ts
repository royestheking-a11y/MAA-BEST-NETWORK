export interface NetxOnuRecord {
  id: string;
  mac: string;
  ponPort: string;
  status: "online" | "offline";
  rxPower: string;
  customer: string;
  oltServer: "OLT1" | "OLT2";
}

export const AUTHENTIC_NETX_ONUS: NetxOnuRecord[] = [
  {
    "id": "onu-netx-real-1",
    "mac": "4c:46:d1:55:08:25",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-26.7 dBm",
    "customer": "Mbn@abdurrobkha",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-2",
    "mac": "00:d3:9e:e2:64:e4",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-24.4 dBm",
    "customer": "Mbn@popibegum",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-3",
    "mac": "82:46:42:30:c5:48",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-15.3 dBm",
    "customer": "Mbn@sumon",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-4",
    "mac": "82:46:21:10:0e:98",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-26.3 dBm",
    "customer": "Mbn@jasim",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-5",
    "mac": "a2:3d:09:1b:a7:d0",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-22.5 dBm",
    "customer": "Mbn@sobuj",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-6",
    "mac": "00:d5:9e:d5:82:44",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-26.9 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-7",
    "mac": "4c:f9:a7:67:68:7b",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-25 dBm",
    "customer": "Mbn@arifhosainsuman",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-8",
    "mac": "a2:3e:03:0a:1e:10",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-16.9 dBm",
    "customer": "Mbn@akterhossain",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-9",
    "mac": "a0:7d:12:15:db:20",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-23.5 dBm",
    "customer": "Mbn@rajib",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-10",
    "mac": "b4:64:15:bb:14:fb",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-24.5 dBm",
    "customer": "Mbn@alalmirdha",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-11",
    "mac": "f8:e8:11:2c:c1:9c",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-21 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-12",
    "mac": "40:92:49:8a:34:b5",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-25.3 dBm",
    "customer": "Mbn@romjanhawlader",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-13",
    "mac": "a2:3d:12:12:5c:d0",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-19.2 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-14",
    "mac": "50:5b:1d:b2:43:bc",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-17 dBm",
    "customer": "Mbn@nazimuddin",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-15",
    "mac": "b4:64:15:bb:02:9f",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-21.8 dBm",
    "customer": "Mbn@lamiyaakter",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-16",
    "mac": "82:46:42:30:c5:48",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-20.8 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-17",
    "mac": "4c:46:d1:98:0e:c3",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-30.4 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-18",
    "mac": "70:a5:6a:2e:f6:93",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-29.2 dBm",
    "customer": "Mbn@ruma",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-19",
    "mac": "50:5b:1d:39:d2:7f",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-26.5 dBm",
    "customer": "Mbn@mdtakiburrahman",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-20",
    "mac": "68:8f:84:14:b4:7c",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-21.4 dBm",
    "customer": "Mbn@monirhowlader",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-21",
    "mac": "a2:3d:09:1b:a7:d0",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-27.6 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-22",
    "mac": "a2:3d:12:12:5c:d0",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-14.1 dBm",
    "customer": "Mbn@salamkhan",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-23",
    "mac": "a0:8c:a1:5a:8b:e0",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-20.3 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-24",
    "mac": "00:d5:9e:9e:38:fc",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-33 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-25",
    "mac": "f8:e8:11:2c:c1:9c",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-15.5 dBm",
    "customer": "Mbn@khukumani",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-26",
    "mac": "4c:d7:c8:a8:5d:7b",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-32.2 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-27",
    "mac": "00:d3:9e:75:bd:1c",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-14.4 dBm",
    "customer": "Mbn@imranhossain",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-28",
    "mac": "48:ad:08:59:57:fe",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-26.3 dBm",
    "customer": "Mbn@ashikur",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-29",
    "mac": "4c:46:d1:f5:d6:96",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-27.2 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-30",
    "mac": "82:46:21:10:0e:98",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-31.5 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-31",
    "mac": "4c:f9:a7:90:f4:9d",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-24.2 dBm",
    "customer": "Mbn@sowkatkhan",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-32",
    "mac": "a0:94:6a:04:53:59",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-21.1 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-33",
    "mac": "f4:b8:c1:b9:22:0f",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-28.5 dBm",
    "customer": "Mbn@khadizabegum",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-34",
    "mac": "48:ad:08:59:57:fe",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-31.5 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-35",
    "mac": "9c:7d:a3:7e:61:c5",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-24.2 dBm",
    "customer": "Mbn@sohelrana",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-36",
    "mac": "9c:7d:a3:7e:61:c5",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-30 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-37",
    "mac": "fc:e3:3c:0d:10:08",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-15.1 dBm",
    "customer": "Mbn@zalilmridha",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-38",
    "mac": "a0:8c:a1:5a:8b:e0",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-14.8 dBm",
    "customer": "Mbn@forkan",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-39",
    "mac": "4c:f9:a7:24:fe:14",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-29.5 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-40",
    "mac": "68:89:c1:5c:63:ba",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-12.8 dBm",
    "customer": "Mbn@mojibarbepari",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-41",
    "mac": "4c:f9:a3:52:0e:41",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-19.1 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-42",
    "mac": "a2:3e:08:16:7b:40",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-25.5 dBm",
    "customer": "Mbn@kamalhossain",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-43",
    "mac": "4c:46:d1:55:08:25",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-31.5 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-44",
    "mac": "a0:94:6a:04:53:59",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-15.7 dBm",
    "customer": "Mbn@abdulalim",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-45",
    "mac": "00:d3:9e:e2:64:e4",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-30 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-46",
    "mac": "4c:d7:c8:a8:5d:7b",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-25.6 dBm",
    "customer": "Mbn@sabbirhosain",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-47",
    "mac": "a0:7f:c2:41:4a:f8",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-24.6 dBm",
    "customer": "Mbn@samimchokder",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-48",
    "mac": "fc:e3:3c:0d:10:08",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-20.5 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-49",
    "mac": "94:04:9c:14:97:d9",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-33.9 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-50",
    "mac": "a2:4f:b2:04:12:88",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-22.5 dBm",
    "customer": "Mbn@mosarafkha",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-51",
    "mac": "4c:46:d1:98:0e:c3",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-25.3 dBm",
    "customer": "Mbn@aminulislam",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-52",
    "mac": "4c:f9:a7:67:68:7b",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-30.9 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-53",
    "mac": "4c:46:d1:f5:d6:96",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-21.6 dBm",
    "customer": "Mbn@mdesahakhawlader",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-54",
    "mac": "94:04:9c:14:97:d9",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-27.9 dBm",
    "customer": "Mbn@akter",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-55",
    "mac": "00:d5:9e:e3:6b:d6",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-28.5 dBm",
    "customer": "Mbn@modasser",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-56",
    "mac": "a2:3f:07:30:6b:00",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-24.6 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-57",
    "mac": "80:d4:a5:62:c6:af",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-21.2 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-58",
    "mac": "00:d5:9e:9e:38:fc",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-27.6 dBm",
    "customer": "Mbn@motaleb",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-59",
    "mac": "4c:f9:a7:24:fe:14",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-24.4 dBm",
    "customer": "Mbn@rakibkhan",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-60",
    "mac": "a2:3e:08:16:7b:40",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-31.5 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-61",
    "mac": "30:f3:35:99:0b:ab",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-27.9 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-62",
    "mac": "ac:85:3d:b8:79:f2",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-21.6 dBm",
    "customer": "Mbn@sadeka",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-63",
    "mac": "ac:85:3d:b8:79:f2",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-26.5 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-64",
    "mac": "24:4c:07:f2:4c:83",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-25.8 dBm",
    "customer": "Mbn@dinislam",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-65",
    "mac": "80:d4:a5:64:65:5f",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-26.5 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-66",
    "mac": "a2:3f:07:30:6b:00",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-18.7 dBm",
    "customer": "Mbn@mizanurrahoman",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-67",
    "mac": "80:d4:a5:64:65:5f",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-21.1 dBm",
    "customer": "Mbn@ferdus",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-68",
    "mac": "24:4c:07:f2:4c:83",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-31.5 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-69",
    "mac": "80:d4:a5:3a:4b:7f",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-26 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-70",
    "mac": "00:d5:9e:d5:82:44",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-33 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-71",
    "mac": "00:d3:9e:3d:06:f6",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-72",
    "mac": "30:f3:35:99:0b:ab",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-22.5 dBm",
    "customer": "Mbn@shanta",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-73",
    "mac": "80:d4:a5:38:d4:5f",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-26.3 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-74",
    "mac": "4c:f9:a7:e0:f3:cb",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-26.5 dBm",
    "customer": "Mbn@mdnuralamtalukder",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-75",
    "mac": "00:d3:9e:3d:06:f6",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-25.2 dBm",
    "customer": "Mbn@yeamin",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-76",
    "mac": "80:d4:a5:3a:4b:7f",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-33 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-77",
    "mac": "80:d4:a5:62:c6:af",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-15.8 dBm",
    "customer": "Mbn@asma",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-78",
    "mac": "00:d5:9e:e3:6b:d6",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-33 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-79",
    "mac": "4c:f9:a7:e0:f3:cb",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-30.9 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-80",
    "mac": "a2:3e:03:0a:1e:10",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-22.1 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-81",
    "mac": "a0:7f:c2:41:4a:f8",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-30.4 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-82",
    "mac": "40:92:49:8a:34:b5",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-31.5 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-83",
    "mac": "ac:85:3d:2d:ac:39",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-84",
    "mac": "a2:4f:b2:04:12:88",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-28.2 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-85",
    "mac": "50:5b:1d:39:d2:7f",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-33 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-86",
    "mac": "fc:e3:3c:40:79:b3",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-87",
    "mac": "c0:7e:40:ab:a2:3f",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-17.6 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-88",
    "mac": "4c:f9:a2:2e:4e:eb",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-89",
    "mac": "00:d5:9e:60:75:1e",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-17.8 dBm",
    "customer": "Mbn@mohammadali",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-90",
    "mac": "a2:4f:05:24:e8:70",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-91",
    "mac": "38:d4:a5:99:8c:ef",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-92",
    "mac": "4c:f9:a7:5a:a7:4d",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-14.1 dBm",
    "customer": "Mbn@almahabub",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-93",
    "mac": "4c:f9:a4:aa:e0:24",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-12.7 dBm",
    "customer": "Mbn@sahidulislam",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-94",
    "mac": "48:46:fb:d9:b6:66",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-95",
    "mac": "48:46:fb:d9:b6:66",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-11.9 dBm",
    "customer": "Mbn@kalambiswas",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-96",
    "mac": "cc:52:89:09:57:69",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-97",
    "mac": "4c:46:d1:b1:7b:ad",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-98",
    "mac": "f4:b8:c5:a6:2f:39",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-17.9 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-99",
    "mac": "4c:d7:c8:e3:14:5c",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-100",
    "mac": "4c:46:d1:1d:6a:98",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-24 dBm",
    "customer": "Mbn@abdurrahaman",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-101",
    "mac": "a2:4f:a2:71:dd:60",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-102",
    "mac": "4c:46:d1:1d:d0:44",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-17.3 dBm",
    "customer": "Mbn@khadizaakter",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-103",
    "mac": "80:66:29:0d:32:0a",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-104",
    "mac": "b4:64:15:ba:bc:47",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-25.3 dBm",
    "customer": "Mbn@ataurrahaman",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-105",
    "mac": "b4:64:15:b5:07:46",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-106",
    "mac": "ac:12:8e:90:9c:f0",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-26.3 dBm",
    "customer": "Mbn@krim",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-107",
    "mac": "40:92:49:ad:d0:9d",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-20.5 dBm",
    "customer": "Mbn@habiburrahman",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-108",
    "mac": "a2:4e:05:25:28:b0",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-109",
    "mac": "c0:7e:40:ab:a2:3f",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-110",
    "mac": "b4:64:15:b5:07:46",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-20.6 dBm",
    "customer": "Mbn@mdabulhossain",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-111",
    "mac": "c0:7e:40:e2:06:61",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "—",
    "customer": "Mbn@mdabubakersiddik",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-112",
    "mac": "00:d5:9e:76:5a:ea",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-113",
    "mac": "cc:52:89:09:57:69",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-19.7 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-114",
    "mac": "a0:7e:12:22:81:60",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-115",
    "mac": "4c:ae:1c:79:0b:b0",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-14.8 dBm",
    "customer": "Mbn@kawsarhamid",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-116",
    "mac": "4c:f9:a7:90:b2:a7",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-117",
    "mac": "00:d3:9e:79:75:54",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-13.3 dBm",
    "customer": "Mbn@siamahmed",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-118",
    "mac": "1c:01:a7:93:dd:1e",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-119",
    "mac": "80:d4:a5:08:31:cf",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-23.3 dBm",
    "customer": "Mbn@sazzadahamed",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-120",
    "mac": "ac:12:8e:90:9c:f0",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-121",
    "mac": "80:f1:a8:5a:ac:70",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-122",
    "mac": "4c:46:d1:b1:7b:ad",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-27.4 dBm",
    "customer": "Mbn@sonia",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-123",
    "mac": "4c:46:d1:96:ef:83",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-29.2 dBm",
    "customer": "Mbn@rojibegom",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-124",
    "mac": "4c:46:d1:1d:d0:44",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-125",
    "mac": "a0:7d:05:30:14:8c",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-22.2 dBm",
    "customer": "Mbn@rahimbepari",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-126",
    "mac": "00:d3:9e:79:75:54",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-127",
    "mac": "4c:46:d1:96:ef:83",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-128",
    "mac": "80:66:29:0d:32:0a",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-24.5 dBm",
    "customer": "Mbn@babu",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-129",
    "mac": "40:92:49:ad:d0:9d",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-130",
    "mac": "80:f1:a8:5a:ac:70",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-18.9 dBm",
    "customer": "Mbn@taniyaakter",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-131",
    "mac": "a0:7d:05:30:14:8c",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-132",
    "mac": "4c:f9:a2:2e:4e:eb",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-12.2 dBm",
    "customer": "Mbn@obaidul",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-133",
    "mac": "a2:4f:10:14:61:c0",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-134",
    "mac": "4c:f9:a7:f5:d3:18",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-27.4 dBm",
    "customer": "Mbn@tanjelabegum",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-135",
    "mac": "4c:f9:b4:94:6f:80",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-23 dBm",
    "customer": "Mbn@samimusman",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-136",
    "mac": "a2:3d:12:16:82:f0",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-137",
    "mac": "a2:4e:05:24:06:e0",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-13.1 dBm",
    "customer": "Mbn@khaled",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-138",
    "mac": "00:d3:9e:8e:e5:6e",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-139",
    "mac": "4c:f9:b4:94:6f:80",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-140",
    "mac": "4c:46:d1:96:ee:1b",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-20.1 dBm",
    "customer": "Mbn@shahanazparvin",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-141",
    "mac": "4c:d7:c8:e3:14:5c",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-21.1 dBm",
    "customer": "Mbn@salma",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-142",
    "mac": "f0:2f:a7:05:14:ae",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-143",
    "mac": "80:d4:a5:64:5f:9f",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-14.3 dBm",
    "customer": "Mbn@saharakhatun",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-144",
    "mac": "00:d5:9e:60:75:1e",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-145",
    "mac": "82:46:12:91:31:90",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-7 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-146",
    "mac": "68:89:c1:29:b0:f0",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-147",
    "mac": "4c:f9:a7:90:b2:a7",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-22 dBm",
    "customer": "Mbn@mdshohag",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-148",
    "mac": "e4:2d:7b:5b:49:ff",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-149",
    "mac": "4c:f9:a6:88:47:2b",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-26.9 dBm",
    "customer": "Mbn@rehana",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-150",
    "mac": "48:ad:08:54:c4:f3",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-151",
    "mac": "a0:8c:a3:e5:ba:02",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-21.1 dBm",
    "customer": "Mbn@rabbihasan",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-152",
    "mac": "a2:4f:05:24:72:c0",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-153",
    "mac": "a2:4f:05:24:e8:70",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-19.6 dBm",
    "customer": "Mbn@azizulhaque",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-154",
    "mac": "a2:3e:08:16:5e:10",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-155",
    "mac": "a2:3e:05:09:23:70",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-156",
    "mac": "4c:f9:a1:91:8a:60",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-23.2 dBm",
    "customer": "Mbn@khalilhowlader",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-157",
    "mac": "68:89:c1:29:b0:f0",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-16.8 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-158",
    "mac": "a2:8d:04:20:e5:c0",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-159",
    "mac": "a2:3d:12:12:3a:e0",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-21.1 dBm",
    "customer": "Mbn@abdullah",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-160",
    "mac": "00:d5:9e:9e:f1:10",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-161",
    "mac": "ac:85:3d:42:b1:23",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-162",
    "mac": "a2:4e:05:25:28:b0",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-19.2 dBm",
    "customer": "Mbn@sabujhowlader",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-163",
    "mac": "a0:8c:a3:e5:ba:02",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-164",
    "mac": "00:d5:9e:76:5a:ea",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-21 dBm",
    "customer": "Mbn@anoar",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-165",
    "mac": "1c:01:a7:93:dd:1e",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-26.5 dBm",
    "customer": "Mbn@makfaruddin",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-166",
    "mac": "a2:3d:12:12:3a:e0",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-167",
    "mac": "a2:3e:05:09:23:70",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-20.5 dBm",
    "customer": "Mbn@lutfunnesa",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-168",
    "mac": "a2:4e:05:24:06:e0",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-169",
    "mac": "4c:f9:a7:f5:d3:18",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-170",
    "mac": "48:ad:08:54:c4:f3",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-24.8 dBm",
    "customer": "Mbn@bilalhossain",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-171",
    "mac": "a2:4e:05:25:47:c0",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-172",
    "mac": "4c:f9:a2:a0:b5:75",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-27.4 dBm",
    "customer": "Mbn@saifulsarder",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-173",
    "mac": "00:d5:9e:9e:f1:10",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-23.3 dBm",
    "customer": "Mbn@mueeinal",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-174",
    "mac": "80:d4:a5:08:31:cf",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-175",
    "mac": "80:d4:a5:08:1d:af",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-176",
    "mac": "a2:4f:10:14:61:c0",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-19.6 dBm",
    "customer": "Mbn@brac",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-177",
    "mac": "a2:8d:04:20:e5:c0",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-31.5 dBm",
    "customer": "Mbn@titul",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-178",
    "mac": "4c:f9:a7:aa:0c:ff",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-179",
    "mac": "80:d4:a5:08:1d:af",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-22 dBm",
    "customer": "Mbn@lipy",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-180",
    "mac": "4c:f9:a1:91:8a:60",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-181",
    "mac": "00:d5:9e:9e:f1:34",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-182",
    "mac": "38:d4:a5:99:8c:ef",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-12.4 dBm",
    "customer": "Mbn@fahima",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-183",
    "mac": "4c:f9:a6:88:47:2b",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-184",
    "mac": "a2:3d:12:16:82:f0",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-27.2 dBm",
    "customer": "Mbn@imran",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-185",
    "mac": "4c:f9:a4:39:0b:31",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-186",
    "mac": "4c:f9:a1:fc:2e:85",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-30.4 dBm",
    "customer": "Mbn@shazidulalom",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-187",
    "mac": "a2:4f:a2:71:dd:60",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-21.8 dBm",
    "customer": "Mbn@rabiulawal",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-188",
    "mac": "4c:f9:a1:fc:2e:85",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-189",
    "mac": "a2:3e:08:16:5e:10",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-26.5 dBm",
    "customer": "Mbn@moyemsikder",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-190",
    "mac": "4c:f9:a7:5a:a7:4d",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-191",
    "mac": "4c:f9:a2:a0:b5:75",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-192",
    "mac": "e4:2d:7b:5b:49:ff",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-17.1 dBm",
    "customer": "Mbn@mohasin",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-193",
    "mac": "24:4c:07:5a:23:a7",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-194",
    "mac": "00:d3:9e:8e:e5:6e",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-20.4 dBm",
    "customer": "Mbn@fatema",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-195",
    "mac": "a2:4f:01:06:93:20",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-196",
    "mac": "f0:2f:a7:05:14:ae",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-21.3 dBm",
    "customer": "Mbn@didarbepari",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-197",
    "mac": "4c:ae:1c:79:0b:b0",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-198",
    "mac": "4c:f9:a7:aa:0c:ff",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-21.8 dBm",
    "customer": "Mbn@forhadmollah",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-199",
    "mac": "4c:f9:a4:aa:e0:24",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-200",
    "mac": "00:d5:9e:9e:f1:34",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-20.1 dBm",
    "customer": "Mbn@rifatsarder",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-201",
    "mac": "82:46:12:91:31:90",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-202",
    "mac": "a2:4f:05:24:72:c0",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-28.8 dBm",
    "customer": "Mbn@mdsabbirapurbo",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-203",
    "mac": "a2:4f:01:06:93:20",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-33 dBm",
    "customer": "Mbn@shaalam",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-204",
    "mac": "4c:46:d1:1d:6a:98",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-205",
    "mac": "f4:b8:c5:a6:2f:39",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-206",
    "mac": "24:4c:07:5a:23:a7",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-26.9 dBm",
    "customer": "Mbn@mazedabegum",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-207",
    "mac": "4c:f9:a4:39:0b:31",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-25.5 dBm",
    "customer": "Mbn@farzanadina",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-208",
    "mac": "c0:7e:40:e2:06:61",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-209",
    "mac": "a0:7e:12:22:81:60",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-29.2 dBm",
    "customer": "Mbn@kazikhalilur",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-210",
    "mac": "f4:b8:c1:a3:26:30",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-211",
    "mac": "80:d4:a5:64:5f:9f",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-212",
    "mac": "ac:85:3d:42:b1:23",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-28.5 dBm",
    "customer": "Mbn@rifathossin",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-213",
    "mac": "4c:46:d1:96:ee:1b",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-214",
    "mac": "a0:7f:b1:60:c4:60",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-215",
    "mac": "4c:46:d1:87:14:77",
    "ponPort": "epon 0/3",
    "status": "online",
    "rxPower": "-27.9 dBm",
    "customer": "Mbn@abulmoksed",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-216",
    "mac": "f4:b8:c4:f5:11:d5",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-217",
    "mac": "f4:b8:c4:f5:11:d5",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-22 dBm",
    "customer": "Mbn@shoyeb",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-218",
    "mac": "00:d3:9e:79:75:ba",
    "ponPort": "epon 0/3",
    "status": "online",
    "rxPower": "-32.2 dBm",
    "customer": "Mbn@limon",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-219",
    "mac": "4c:46:d1:87:14:77",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-220",
    "mac": "00:d3:9e:74:47:36",
    "ponPort": "epon 0/3",
    "status": "online",
    "rxPower": "-29.2 dBm",
    "customer": "Mbn@halima",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-221",
    "mac": "4c:f9:a1:d2:b6:ea",
    "ponPort": "epon 0/3",
    "status": "online",
    "rxPower": "-25.8 dBm",
    "customer": "Mbn@jannat",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-222",
    "mac": "80:d4:a5:64:65:6f",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-223",
    "mac": "ac:85:3d:68:c7:c8",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-224",
    "mac": "4c:f9:a1:ee:c8:36",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-17.3 dBm",
    "customer": "Mbn@aleyabegum",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-225",
    "mac": "00:d5:9e:70:77:76",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-21 dBm",
    "customer": "Mbn@sajolmia",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-226",
    "mac": "80:d4:a5:3a:4c:cf",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-227",
    "mac": "00:d3:9e:79:1e:cc",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-228",
    "mac": "ac:85:3d:68:c7:c8",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-31.5 dBm",
    "customer": "Mbn@alinur",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-229",
    "mac": "a0:7f:b1:60:c4:60",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-27.6 dBm",
    "customer": "Mbn@arshedali",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-230",
    "mac": "b4:64:15:ba:c4:ff",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-231",
    "mac": "b4:64:15:ba:76:6f",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-21.8 dBm",
    "customer": "Mbn@asad",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-232",
    "mac": "00:d3:9e:79:75:ba",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-233",
    "mac": "98:c7:a4:67:5c:9d",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-28.2 dBm",
    "customer": "Mbn@rupiabegum",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-234",
    "mac": "00:d3:9e:73:68:88",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-235",
    "mac": "00:d3:9e:77:89:f6",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-236",
    "mac": "b4:64:15:ba:c4:ff",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-27.2 dBm",
    "customer": "Mbn@shilpibegum",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-237",
    "mac": "b4:64:15:ba:83:93",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-238",
    "mac": "b4:64:15:ba:83:93",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-28.2 dBm",
    "customer": "Mbn@mstdola",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-239",
    "mac": "00:d3:9e:73:68:88",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-24.3 dBm",
    "customer": "Mbn@resmaakter",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-240",
    "mac": "00:d3:9e:74:47:36",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-241",
    "mac": "00:d3:9e:77:89:f6",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-20 dBm",
    "customer": "Mbn@nayemhasan",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-242",
    "mac": "a2:4e:01:18:2f:00",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-27.2 dBm",
    "customer": "Mbn@hafijul",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-243",
    "mac": "b4:64:15:ba:76:6f",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-244",
    "mac": "4c:f9:a1:d2:b6:ea",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-245",
    "mac": "ac:85:3d:df:f1:2d",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-20.2 dBm",
    "customer": "Mbn@ansaruddin",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-246",
    "mac": "a0:7e:12:22:7c:80",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-23 dBm",
    "customer": "Mbn@liza",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-247",
    "mac": "00:d5:9e:62:ed:58",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-23.8 dBm",
    "customer": "Mbn@abubakkarkazi",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-248",
    "mac": "a2:4e:04:09:9c:f0",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-249",
    "mac": "a2:7e:04:1a:ef:d0",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-250",
    "mac": "00:d3:9e:79:1e:a8",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-22.2 dBm",
    "customer": "Mbn@reshma",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-251",
    "mac": "f0:98:38:32:1c:2c",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-252",
    "mac": "80:d4:a5:3a:4c:cf",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-23 dBm",
    "customer": "Mbn@sajalmollik",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-253",
    "mac": "00:d5:9e:70:77:76",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-254",
    "mac": "a2:7e:04:1a:ef:d0",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-30.4 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-255",
    "mac": "00:d3:9e:79:1e:a8",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-256",
    "mac": "a2:7e:04:1a:f0:70",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-33.9 dBm",
    "customer": "Mbn@ziyasmin",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-257",
    "mac": "ac:85:3d:df:f1:2d",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-258",
    "mac": "f0:98:38:32:1c:2c",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-24 dBm",
    "customer": "Mbn@hasanatmian",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-259",
    "mac": "80:d4:a5:64:65:6f",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-20 dBm",
    "customer": "Mbn@jafor",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-260",
    "mac": "a0:7e:12:22:7c:80",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-261",
    "mac": "00:d3:9e:79:1e:cc",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-30 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-262",
    "mac": "20:3d:b2:5c:3c:1f",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-263",
    "mac": "00:d5:9e:62:ed:58",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-264",
    "mac": "a2:4e:04:09:9c:f0",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-30.4 dBm",
    "customer": "Mbn@shahida",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-265",
    "mac": "a2:7e:04:1a:f0:70",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-266",
    "mac": "4c:f9:a2:c4:56:71",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-33 dBm",
    "customer": "Mbn@nasir",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-267",
    "mac": "4c:f9:a2:c4:56:71",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-268",
    "mac": "20:3d:b2:5c:3c:1f",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-19.1 dBm",
    "customer": "Mbn@siddikur",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-269",
    "mac": "4c:f9:a1:ee:c8:36",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-270",
    "mac": "98:c7:a4:67:5c:9d",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-271",
    "mac": "a2:4e:01:18:2f:00",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "—",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-272",
    "mac": "a2:3e:05:14:99:60",
    "ponPort": "epon 0/4",
    "status": "online",
    "rxPower": "-23.3 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-273",
    "mac": "00:d5:9e:e0:06:54",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-23.7 dBm",
    "customer": "Mbn@alamin",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-274",
    "mac": "4c:f9:a2:94:35:09",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-18 dBm",
    "customer": "Mbn@mahabulmia",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-275",
    "mac": "0c:a0:dc:e8:a3:ba",
    "ponPort": "epon 0/4",
    "status": "online",
    "rxPower": "-30 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-276",
    "mac": "a2:4e:01:18:06:00",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-20.3 dBm",
    "customer": "Mbn@hannankhan",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-277",
    "mac": "00:d5:9e:9d:6e:04",
    "ponPort": "epon 0/4",
    "status": "online",
    "rxPower": "-19.7 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-278",
    "mac": "00:d5:9e:e0:06:54",
    "ponPort": "epon 0/4",
    "status": "online",
    "rxPower": "-24.4 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-279",
    "mac": "78:d7:52:40:af:c4",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-24.3 dBm",
    "customer": "Mbn@rahmatullah",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-280",
    "mac": "b4:64:15:b5:eb:ca",
    "ponPort": "epon 0/4",
    "status": "online",
    "rxPower": "-21.8 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-281",
    "mac": "0c:a0:dc:e8:a3:ba",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-27.6 dBm",
    "customer": "Mbn@kamalmerdha",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-282",
    "mac": "00:d5:9e:9d:6e:04",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-17.3 dBm",
    "customer": "Mbn@layla",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-283",
    "mac": "78:d7:52:40:af:c4",
    "ponPort": "epon 0/4",
    "status": "online",
    "rxPower": "-26.5 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-284",
    "mac": "4c:f9:a2:94:35:09",
    "ponPort": "epon 0/4",
    "status": "online",
    "rxPower": "-20.3 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-285",
    "mac": "00:d3:9e:79:1e:ba",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-22.4 dBm",
    "customer": "Mbn@mizanur",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-286",
    "mac": "a2:3e:05:14:99:60",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-20.9 dBm",
    "customer": "Mbn@lima",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-287",
    "mac": "24:44:27:cf:ff:45",
    "ponPort": "epon 0/4",
    "status": "online",
    "rxPower": "-22.2 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-288",
    "mac": "a2:4e:03:25:91:b0",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-21.1 dBm",
    "customer": "Mbn@nargisbegum",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-289",
    "mac": "a2:4e:01:18:06:00",
    "ponPort": "epon 0/4",
    "status": "online",
    "rxPower": "-22.9 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-290",
    "mac": "24:44:27:cf:ff:45",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-19.6 dBm",
    "customer": "Mbn@hanif",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-291",
    "mac": "a2:4e:03:25:91:b0",
    "ponPort": "epon 0/4",
    "status": "online",
    "rxPower": "-23.3 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-292",
    "mac": "4c:46:d1:1e:51:d0",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-23.2 dBm",
    "customer": "Mbn@ismailmridha",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-293",
    "mac": "4c:46:d1:1e:51:d0",
    "ponPort": "epon 0/4",
    "status": "online",
    "rxPower": "-25.8 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-294",
    "mac": "b4:64:15:b5:eb:ca",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-19.4 dBm",
    "customer": "Mbn@aminul",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-295",
    "mac": "00:d3:9e:79:1e:ba",
    "ponPort": "epon 0/4",
    "status": "online",
    "rxPower": "-24.3 dBm",
    "customer": "— Unassigned —",
    "oltServer": "OLT2"
  }
];
