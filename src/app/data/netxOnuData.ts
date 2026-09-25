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
    "mac": "4c:46:d1:0d:1d:49",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-19.4 dBm",
    "customer": "Mbn@khadiza",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-2",
    "mac": "4c:f9:a1:d2:b6:ea",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-25.3 dBm",
    "customer": "Mbn@jannat",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-3",
    "mac": "82:46:42:1b:33:6b",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-22.9 dBm",
    "customer": "Mbn@rajibsrder",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-4",
    "mac": "a2:3d:09:22:3e:7c",
    "ponPort": "epon 0/4",
    "status": "online",
    "rxPower": "-23.4 dBm",
    "customer": "Mbn@rohima",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-5",
    "mac": "a0:7d:12:29:49:8d",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-18.5 dBm",
    "customer": "Mbn@mstshahanaz",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-6",
    "mac": "b4:64:15:30:54:9e",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-19.1 dBm",
    "customer": "Mbn@shamim",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-7",
    "mac": "40:92:49:37:5f:af",
    "ponPort": "epon 0/3",
    "status": "online",
    "rxPower": "-17.0 dBm",
    "customer": "Mbn@sumonbepari",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-8",
    "mac": "c0:7e:40:e2:06:61",
    "ponPort": "epon 0/4",
    "status": "online",
    "rxPower": "-24.7 dBm",
    "customer": "Mbn@mdabubakersiddik",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-9",
    "mac": "00:d5:9e:45:75:d1",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-21.5 dBm",
    "customer": "Mbn@tawhid",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-10",
    "mac": "a2:4e:01:18:2f:00",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-25.2 dBm",
    "customer": "Mbn@hafijul",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-11",
    "mac": "bc:20:ba:53:8b:f3",
    "ponPort": "epon 0/3",
    "status": "online",
    "rxPower": "-23.4 dBm",
    "customer": "Mbn@shraboni",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-12",
    "mac": "a2:4f:b2:04:12:88",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-20.7 dBm",
    "customer": "Mbn@mosarafkha",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-13",
    "mac": "28:6c:07:61:a1:15",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-25.2 dBm",
    "customer": "Mbn@mobaraksarder",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-14",
    "mac": "4c:46:d1:68:ac:26",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-23.6 dBm",
    "customer": "Mbn@omar",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-15",
    "mac": "00:d3:9e:6f:b7:37",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-19.3 dBm",
    "customer": "Mbn@aazizmian",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-16",
    "mac": "4c:f9:a2:2e:4e:eb",
    "ponPort": "epon 0/4",
    "status": "online",
    "rxPower": "-20.3 dBm",
    "customer": "Mbn@obaidul",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-17",
    "mac": "80:d4:a5:64:5f:9f",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-23.4 dBm",
    "customer": "Mbn@saharakhatun",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-18",
    "mac": "a0:7d:12:84:d8:6a",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-19.9 dBm",
    "customer": "Mbn@abserali",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-19",
    "mac": "b4:64:15:8b:e3:7b",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-17.8 dBm",
    "customer": "Mbn@suzanbepari",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-20",
    "mac": "4c:46:d1:96:ef:83",
    "ponPort": "epon 0/4",
    "status": "online",
    "rxPower": "-25.4 dBm",
    "customer": "Mbn@rojibegom",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-21",
    "mac": "a2:3d:12:12:5c:d0",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-17.8 dBm",
    "customer": "Mbn@salamkhan",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-22",
    "mac": "00:d5:9e:a0:04:ae",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-18.9 dBm",
    "customer": "Mbn@rezaul",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-23",
    "mac": "e0:67:b3:a7:0f:bf",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-22.3 dBm",
    "customer": "Mbn@jonayet",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-24",
    "mac": "4c:f9:a1:ee:c8:36",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-24.0 dBm",
    "customer": "Mbn@aleyabegum",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-25",
    "mac": "14:14:4b:b5:25:e1",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-16.4 dBm",
    "customer": "Mbn@khobirhawlader",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-26",
    "mac": "28:6c:07:bc:30:f2",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-22.3 dBm",
    "customer": "Mbn@enamulhawlader",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-27",
    "mac": "24:4c:07:5a:23:a7",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-24.6 dBm",
    "customer": "Mbn@mazedabegum",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-28",
    "mac": "00:d3:9e:ca:46:14",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-24.6 dBm",
    "customer": "Mbn@sohag",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-29",
    "mac": "00:d3:9e:79:75:54",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-17.4 dBm",
    "customer": "Mbn@siamahmed",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-30",
    "mac": "a2:3d:09:d8:5c:36",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-19.8 dBm",
    "customer": "Mbn@redaysarder",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-31",
    "mac": "a0:7d:12:df:67:47",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-17.8 dBm",
    "customer": "Mbn@monnikhanam",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-32",
    "mac": "a0:7f:c2:41:4a:f8",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-18.6 dBm",
    "customer": "Mbn@samimchokder",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-33",
    "mac": "00:d3:9e:79:1e:ba",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-20.4 dBm",
    "customer": "Mbn@mizanur",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-34",
    "mac": "f8:e8:11:f4:88:7a",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-16.3 dBm",
    "customer": "Mbn@sagor",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-35",
    "mac": "00:d5:9e:fb:93:8b",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-21.9 dBm",
    "customer": "Mbn@mahiuddin",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-36",
    "mac": "e0:67:b3:02:9e:9c",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-20.3 dBm",
    "customer": "Mbn@mokforalom",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-37",
    "mac": "00:d5:9e:e3:6b:d6",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-17.6 dBm",
    "customer": "Mbn@modasser",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-38",
    "mac": "14:14:4b:10:b4:be",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-19.6 dBm",
    "customer": "Mbn@eliushossain",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-39",
    "mac": "28:6c:07:17:bf:cf",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-17.3 dBm",
    "customer": "Mbn@lamia",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-40",
    "mac": "4c:46:d1:1e:ca:e0",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-20.0 dBm",
    "customer": "Mbn@rased",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-41",
    "mac": "40:92:49:8a:34:b5",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-18.8 dBm",
    "customer": "Mbn@romjanhawlader",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-42",
    "mac": "82:46:42:2c:e0:02",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-25.1 dBm",
    "customer": "Mbn@mahabuba",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-43",
    "mac": "a2:3d:09:33:eb:13",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-23.3 dBm",
    "customer": "Mbn@mohasenmridha",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-44",
    "mac": "a0:7d:12:3a:f6:24",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-22.8 dBm",
    "customer": "Mbn@harunkhan",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-45",
    "mac": "70:a5:6a:2e:f6:93",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-24.7 dBm",
    "customer": "Mbn@ruma",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-46",
    "mac": "68:8f:84:14:b4:7c",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-23.3 dBm",
    "customer": "Mbn@monirhowlader",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-47",
    "mac": "f8:e8:11:4f:17:57",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-24.5 dBm",
    "customer": "Mbn@mohammad",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-48",
    "mac": "80:d4:a5:62:c6:af",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-22.9 dBm",
    "customer": "Mbn@asma",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-49",
    "mac": "ac:85:3d:68:c7:c8",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-19.5 dBm",
    "customer": "Mbn@alinur",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-50",
    "mac": "80:f1:a8:5a:ac:70",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-22.0 dBm",
    "customer": "Mbn@taniyaakter",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-51",
    "mac": "a0:7d:12:15:db:20",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-22.0 dBm",
    "customer": "Mbn@rajib",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-52",
    "mac": "a2:3d:09:1b:a7:d0",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-23.5 dBm",
    "customer": "Mbn@sobuj",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-53",
    "mac": "4c:46:d1:87:14:77",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-23.0 dBm",
    "customer": "Mbn@abulmoksed",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-54",
    "mac": "00:d3:9e:3d:06:f6",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-16.6 dBm",
    "customer": "Mbn@yeamin",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-55",
    "mac": "ac:12:8e:90:9c:f0",
    "ponPort": "epon 0/3",
    "status": "online",
    "rxPower": "-19.3 dBm",
    "customer": "Mbn@krim",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-56",
    "mac": "a2:3d:09:8e:7a:f0",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-19.7 dBm",
    "customer": "Mbn@mdabdussalamtalukder",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-57",
    "mac": "a2:4e:01:18:06:00",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-23.9 dBm",
    "customer": "Mbn@hannankhan",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-58",
    "mac": "00:d5:9e:70:77:76",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-18.6 dBm",
    "customer": "Mbn@sajolmia",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-59",
    "mac": "00:d5:9e:9e:f1:10",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-23.9 dBm",
    "customer": "Mbn@mueeinal",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-60",
    "mac": "a2:4e:04:09:9c:f0",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-21.9 dBm",
    "customer": "Mbn@shahida",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-61",
    "mac": "68:89:c1:5c:63:ba",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-16.1 dBm",
    "customer": "Mbn@mojibarbepari",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-62",
    "mac": "f8:e8:11:2c:c1:9c",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-19.4 dBm",
    "customer": "Mbn@khukumani",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-63",
    "mac": "bc:20:ba:bf:c7:67",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-20.2 dBm",
    "customer": "Mbn@arifmal",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-64",
    "mac": "f0:98:38:32:1c:2c",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-19.0 dBm",
    "customer": "Mbn@hasanatmian",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-65",
    "mac": "4c:f9:a1:fc:2e:85",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-17.5 dBm",
    "customer": "Mbn@shazidulalom",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-66",
    "mac": "00:d3:9e:77:89:f6",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-18.1 dBm",
    "customer": "Mbn@nayemhasan",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-67",
    "mac": "a0:8c:a3:e5:ba:02",
    "ponPort": "epon 0/3",
    "status": "online",
    "rxPower": "-23.3 dBm",
    "customer": "Mbn@rabbihasan",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-68",
    "mac": "4c:f9:a2:a0:b5:75",
    "ponPort": "epon 0/4",
    "status": "online",
    "rxPower": "-25.2 dBm",
    "customer": "Mbn@saifulsarder",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-69",
    "mac": "50:5b:1d:b2:43:bc",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-22.5 dBm",
    "customer": "Mbn@nazimuddin",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-70",
    "mac": "a2:4e:03:25:91:b0",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-23.0 dBm",
    "customer": "Mbn@nargisbegum",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-71",
    "mac": "00:d5:9e:76:5a:ea",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-23.5 dBm",
    "customer": "Mbn@anoar",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-72",
    "mac": "94:04:9c:14:97:d9",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-16.5 dBm",
    "customer": "Mbn@akter",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-73",
    "mac": "48:ad:08:54:c4:f3",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-17.2 dBm",
    "customer": "Mbn@bilalhossain",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-74",
    "mac": "00:d5:9e:0c:40:22",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-22.5 dBm",
    "customer": "Mbn@motiurrahman",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-75",
    "mac": "4c:ae:1c:79:0b:b0",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-19.3 dBm",
    "customer": "Mbn@kawsarhamid",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-76",
    "mac": "bc:20:ba:1a:56:44",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-21.7 dBm",
    "customer": "Mbn@chanmia",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-77",
    "mac": "4c:f9:a7:67:68:7b",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-16.8 dBm",
    "customer": "Mbn@arifhosainsuman",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-78",
    "mac": "a2:3e:05:09:23:70",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-21.1 dBm",
    "customer": "Mbn@lutfunnesa",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-79",
    "mac": "4c:46:d1:b1:7b:ad",
    "ponPort": "epon 0/3",
    "status": "online",
    "rxPower": "-23.0 dBm",
    "customer": "Mbn@sonia",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-80",
    "mac": "24:44:27:cf:ff:45",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-23.2 dBm",
    "customer": "Mbn@hanif",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-81",
    "mac": "4c:d7:c8:a8:5d:7b",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-20.2 dBm",
    "customer": "Mbn@sabbirhosain",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-82",
    "mac": "4c:f9:a7:24:fe:14",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-23.0 dBm",
    "customer": "Mbn@rakibkhan",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-83",
    "mac": "a0:7d:12:4b:a3:bb",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-19.9 dBm",
    "customer": "Mbn@samiul",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-84",
    "mac": "b4:64:15:52:ae:cc",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-17.0 dBm",
    "customer": "Mbn@molina",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-85",
    "mac": "f4:b8:c1:b9:22:0f",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-21.7 dBm",
    "customer": "Mbn@khadizabegum",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-86",
    "mac": "80:d4:a5:3a:4c:cf",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-23.4 dBm",
    "customer": "Mbn@sajalmollik",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-87",
    "mac": "48:46:fb:d9:b6:66",
    "ponPort": "epon 0/3",
    "status": "online",
    "rxPower": "-16.0 dBm",
    "customer": "Mbn@kalambiswas",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-88",
    "mac": "00:d3:9e:74:47:36",
    "ponPort": "epon 0/4",
    "status": "online",
    "rxPower": "-20.7 dBm",
    "customer": "Mbn@halima",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-89",
    "mac": "00:d3:9e:73:68:88",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-24.6 dBm",
    "customer": "Mbn@resmaakter",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-90",
    "mac": "82:46:21:10:0e:98",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-25.1 dBm",
    "customer": "Mbn@jasim",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-91",
    "mac": "b4:64:15:ba:76:6f",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-24.5 dBm",
    "customer": "Mbn@asad",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-92",
    "mac": "4c:f9:a7:90:b2:a7",
    "ponPort": "epon 0/4",
    "status": "online",
    "rxPower": "-19.5 dBm",
    "customer": "Mbn@mdshohag",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-93",
    "mac": "30:f3:35:99:0b:ab",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-18.0 dBm",
    "customer": "Mbn@shanta",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-94",
    "mac": "a2:3d:12:12:3a:e0",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-21.5 dBm",
    "customer": "Mbn@abdullah",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-95",
    "mac": "80:d4:a5:08:1d:af",
    "ponPort": "epon 0/3",
    "status": "online",
    "rxPower": "-24.9 dBm",
    "customer": "Mbn@lipy",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-96",
    "mac": "4c:f9:a2:c4:56:71",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-21.9 dBm",
    "customer": "Mbn@nasir",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-97",
    "mac": "e4:2d:7b:5b:49:ff",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-16.0 dBm",
    "customer": "Mbn@mohasin",
    "oltServer": "OLT1"
  },
  {
    "id": "onu-netx-real-98",
    "mac": "24:4c:07:f2:4c:83",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-20.5 dBm",
    "customer": "Mbn@dinislam",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-99",
    "mac": "f8:e8:11:bb:53:cb",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-16.3 dBm",
    "customer": "Mbn@mehedi",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-100",
    "mac": "00:d3:9e:79:75:ba",
    "ponPort": "epon 0/4",
    "status": "online",
    "rxPower": "-17.3 dBm",
    "customer": "Mbn@limon",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-101",
    "mac": "b4:64:15:ba:c4:ff",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-25.4 dBm",
    "customer": "Mbn@shilpibegum",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-102",
    "mac": "a2:4f:05:24:72:c0",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-18.7 dBm",
    "customer": "Mbn@mdsabbirapurbo",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-103",
    "mac": "14:14:4b:d7:7f:0f",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-19.0 dBm",
    "customer": "Mbn@rajibkhan",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-104",
    "mac": "48:ad:08:59:57:fe",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-20.4 dBm",
    "customer": "Mbn@ashikur",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-105",
    "mac": "4c:f9:a7:90:f4:9d",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-23.0 dBm",
    "customer": "Mbn@sowkatkhan",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-106",
    "mac": "a2:7e:04:1a:f0:70",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-19.4 dBm",
    "customer": "Mbn@ziyasmin",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-107",
    "mac": "a2:8d:04:20:e5:c0",
    "ponPort": "epon 0/3",
    "status": "online",
    "rxPower": "-24.4 dBm",
    "customer": "Mbn@titul",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-108",
    "mac": "98:c7:a4:67:5c:9d",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-21.4 dBm",
    "customer": "Mbn@rupiabegum",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-109",
    "mac": "a2:4e:05:24:06:e0",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-21.2 dBm",
    "customer": "Mbn@khaled",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-110",
    "mac": "4c:f9:a7:aa:0c:ff",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-16.4 dBm",
    "customer": "Mbn@forhadmollah",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-111",
    "mac": "4c:f9:a7:5a:a7:4d",
    "ponPort": "epon 0/3",
    "status": "online",
    "rxPower": "-17.2 dBm",
    "customer": "Mbn@almahabub",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-112",
    "mac": "4c:46:d1:1d:6a:98",
    "ponPort": "epon 0/4",
    "status": "online",
    "rxPower": "-23.0 dBm",
    "customer": "Mbn@abdurrahaman",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-113",
    "mac": "a2:4f:01:06:93:20",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-20.7 dBm",
    "customer": "Mbn@shaalam",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-114",
    "mac": "a2:3e:03:0a:1e:10",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-23.8 dBm",
    "customer": "Mbn@akterhossain",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-115",
    "mac": "00:d5:9e:e0:06:54",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-16.8 dBm",
    "customer": "Mbn@alamin",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-116",
    "mac": "a0:7e:12:22:7c:80",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-17.2 dBm",
    "customer": "Mbn@liza",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-117",
    "mac": "00:d5:9e:9e:38:fc",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-22.7 dBm",
    "customer": "Mbn@motaleb",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-118",
    "mac": "ac:85:3d:df:f1:2d",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-19.4 dBm",
    "customer": "Mbn@ansaruddin",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-119",
    "mac": "00:d3:9e:e2:64:e4",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-19.7 dBm",
    "customer": "Mbn@popibegum",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-120",
    "mac": "4c:f9:a1:91:8a:60",
    "ponPort": "epon 0/4",
    "status": "online",
    "rxPower": "-24.0 dBm",
    "customer": "Mbn@khalilhowlader",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-121",
    "mac": "4c:f9:a7:f5:d3:18",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-18.3 dBm",
    "customer": "Mbn@tanjelabegum",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-122",
    "mac": "a0:7d:12:5c:50:52",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-20.4 dBm",
    "customer": "Mbn@shadathossin",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-123",
    "mac": "a2:4f:05:24:e8:70",
    "ponPort": "epon 0/3",
    "status": "online",
    "rxPower": "-18.1 dBm",
    "customer": "Mbn@azizulhaque",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-124",
    "mac": "b4:64:15:bb:02:9f",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-20.5 dBm",
    "customer": "Mbn@lamiyaakter",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-125",
    "mac": "b4:64:15:b5:eb:ca",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-25.5 dBm",
    "customer": "Mbn@aminul",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-126",
    "mac": "20:3d:b2:5c:3c:1f",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-22.4 dBm",
    "customer": "Mbn@siddikur",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-127",
    "mac": "00:d3:9e:75:bd:1c",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-25.3 dBm",
    "customer": "Mbn@imranhossain",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-128",
    "mac": "a2:4e:05:25:28:b0",
    "ponPort": "epon 0/4",
    "status": "online",
    "rxPower": "-16.7 dBm",
    "customer": "Mbn@sabujhowlader",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-129",
    "mac": "00:d3:9e:79:1e:a8",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-17.2 dBm",
    "customer": "Mbn@reshma",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-130",
    "mac": "a2:3e:08:16:7b:40",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-17.6 dBm",
    "customer": "Mbn@kamalhossain",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-131",
    "mac": "4c:46:d1:9b:b3:eb",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-22.6 dBm",
    "customer": "Mbn@mostofaali",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-132",
    "mac": "00:d3:9e:a2:be:fc",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-24.9 dBm",
    "customer": "Mbn@yeasin",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-133",
    "mac": "00:d5:9e:9e:f1:34",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-17.2 dBm",
    "customer": "Mbn@rifatsarder",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-134",
    "mac": "a0:7d:05:30:14:8c",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-16.5 dBm",
    "customer": "Mbn@rahimbepari",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-135",
    "mac": "a0:7d:12:b7:df:2f",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-24.7 dBm",
    "customer": "Mbn@aslamhossain",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-136",
    "mac": "9c:7d:a3:7e:61:c5",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-20.9 dBm",
    "customer": "Mbn@sohelrana",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-137",
    "mac": "38:d4:a5:99:8c:ef",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-24.8 dBm",
    "customer": "Mbn@fahima",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-138",
    "mac": "a2:3e:08:16:5e:10",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-18.3 dBm",
    "customer": "Mbn@moyemsikder",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-139",
    "mac": "80:d4:a5:64:65:6f",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-18.2 dBm",
    "customer": "Mbn@jafor",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-140",
    "mac": "e0:67:b3:da:16:84",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-24.3 dBm",
    "customer": "Mbn@sajal",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-141",
    "mac": "a2:3f:07:30:6b:00",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-21.0 dBm",
    "customer": "Mbn@mizanurrahoman",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-142",
    "mac": "14:14:4b:e8:2c:a6",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-20.3 dBm",
    "customer": "Mbn@hasankhan",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-143",
    "mac": "78:d7:52:40:af:c4",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-23.0 dBm",
    "customer": "Mbn@rahmatullah",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-144",
    "mac": "00:d3:9e:8e:e5:6e",
    "ponPort": "epon 0/4",
    "status": "online",
    "rxPower": "-17.2 dBm",
    "customer": "Mbn@fatema",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-145",
    "mac": "ac:85:3d:42:b1:23",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-21.5 dBm",
    "customer": "Mbn@rifathossin",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-146",
    "mac": "1c:01:a7:93:dd:1e",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-23.5 dBm",
    "customer": "Mbn@makfaruddin",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-147",
    "mac": "50:5b:1d:39:d2:7f",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-20.4 dBm",
    "customer": "Mbn@mdtakiburrahman",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-148",
    "mac": "a0:8c:a1:5a:8b:e0",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-18.6 dBm",
    "customer": "Mbn@forkan",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-149",
    "mac": "b4:64:15:19:79:1d",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-23.6 dBm",
    "customer": "Mbn@anoarsarder",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-150",
    "mac": "4c:46:d1:55:08:25",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-22.5 dBm",
    "customer": "Mbn@abdurrobkha",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-151",
    "mac": "82:46:42:30:c5:48",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-16.0 dBm",
    "customer": "Mbn@sumon",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-152",
    "mac": "b4:64:15:ba:bc:47",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-19.3 dBm",
    "customer": "Mbn@ataurrahaman",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-153",
    "mac": "f0:2f:a7:05:14:ae",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-21.3 dBm",
    "customer": "Mbn@didarbepari",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-154",
    "mac": "b4:64:15:bb:14:fb",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-20.6 dBm",
    "customer": "Mbn@alalmirdha",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-155",
    "mac": "a0:94:6a:04:53:59",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-24.4 dBm",
    "customer": "Mbn@abdulalim",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-156",
    "mac": "28:6c:07:4a:c6:94",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-23.4 dBm",
    "customer": "Mbn@nurmohammad",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-157",
    "mac": "4c:46:d1:51:d1:a5",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-22.3 dBm",
    "customer": "Mbn@jamila",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-158",
    "mac": "00:d3:9e:58:dc:b6",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-19.9 dBm",
    "customer": "Mbn@jalalsarder",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-159",
    "mac": "4c:f9:a6:88:47:2b",
    "ponPort": "epon 0/3",
    "status": "online",
    "rxPower": "-23.3 dBm",
    "customer": "Mbn@rehana",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-160",
    "mac": "a2:4f:a2:71:dd:60",
    "ponPort": "epon 0/4",
    "status": "online",
    "rxPower": "-23.4 dBm",
    "customer": "Mbn@rabiulawal",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-161",
    "mac": "a0:7f:b1:60:c4:60",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-24.8 dBm",
    "customer": "Mbn@arshedali",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-162",
    "mac": "f4:b8:c4:f5:11:d5",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-19.5 dBm",
    "customer": "Mbn@shoyeb",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-163",
    "mac": "4c:f9:a7:e0:f3:cb",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-23.3 dBm",
    "customer": "Mbn@mdnuralamtalukder",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-164",
    "mac": "80:d4:a5:64:65:5f",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-16.9 dBm",
    "customer": "Mbn@ferdus",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-165",
    "mac": "a0:7e:12:22:81:60",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-17.3 dBm",
    "customer": "Mbn@kazikhalilur",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-166",
    "mac": "00:d5:9e:62:ed:58",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-24.8 dBm",
    "customer": "Mbn@abubakkarkazi",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-167",
    "mac": "00:d5:9e:60:75:1e",
    "ponPort": "epon 0/3",
    "status": "online",
    "rxPower": "-23.2 dBm",
    "customer": "Mbn@mohammadali",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-168",
    "mac": "a2:3e:05:14:99:60",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-19.1 dBm",
    "customer": "Mbn@lima",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-169",
    "mac": "4c:46:d1:1e:51:d0",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-23.5 dBm",
    "customer": "Mbn@ismailmridha",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-170",
    "mac": "b4:64:15:b5:07:46",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-24.2 dBm",
    "customer": "Mbn@mdabulhossain",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-171",
    "mac": "40:92:49:ad:d0:9d",
    "ponPort": "epon 0/3",
    "status": "online",
    "rxPower": "-16.6 dBm",
    "customer": "Mbn@habiburrahman",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-172",
    "mac": "ac:85:3d:b8:79:f2",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-20.1 dBm",
    "customer": "Mbn@sadeka",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-173",
    "mac": "4c:46:d1:f5:d6:96",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-21.0 dBm",
    "customer": "Mbn@mdesahakhawlader",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-174",
    "mac": "00:d5:9e:9d:6e:04",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-18.0 dBm",
    "customer": "Mbn@layla",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-175",
    "mac": "b4:64:15:cf:97:d7",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-17.8 dBm",
    "customer": "Mbn@romanaakter",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-176",
    "mac": "0c:a0:dc:e8:a3:ba",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-23.7 dBm",
    "customer": "Mbn@kamalmerdha",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-177",
    "mac": "f8:e8:11:dd:ad:f9",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-24.6 dBm",
    "customer": "Mbn@buro",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-178",
    "mac": "4c:f9:a4:aa:e0:24",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-21.4 dBm",
    "customer": "Mbn@sahidulislam",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-179",
    "mac": "a2:3d:12:16:82:f0",
    "ponPort": "epon 0/3",
    "status": "online",
    "rxPower": "-21.5 dBm",
    "customer": "Mbn@imran",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-180",
    "mac": "4c:f9:b4:94:6f:80",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-21.1 dBm",
    "customer": "Mbn@samimusman",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-181",
    "mac": "14:14:4b:f9:d9:3d",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-18.6 dBm",
    "customer": "Mbn@sarmin",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-182",
    "mac": "80:d4:a5:08:31:cf",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-19.1 dBm",
    "customer": "Mbn@sazzadahamed",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-183",
    "mac": "4c:46:d1:96:ee:1b",
    "ponPort": "epon 0/3",
    "status": "online",
    "rxPower": "-16.2 dBm",
    "customer": "Mbn@shahanazparvin",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-184",
    "mac": "b4:64:15:ba:83:93",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-24.6 dBm",
    "customer": "Mbn@mstdola",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-185",
    "mac": "a2:4f:10:14:61:c0",
    "ponPort": "epon 0/1",
    "status": "offline",
    "rxPower": "-21.7 dBm",
    "customer": "Mbn@brac",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-186",
    "mac": "fc:e3:3c:0d:10:08",
    "ponPort": "epon 0/2",
    "status": "offline",
    "rxPower": "-22.3 dBm",
    "customer": "Mbn@zalilmridha",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-187",
    "mac": "4c:d7:c8:e3:14:5c",
    "ponPort": "epon 0/3",
    "status": "online",
    "rxPower": "-17.3 dBm",
    "customer": "Mbn@salma",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-188",
    "mac": "4c:f9:a2:94:35:09",
    "ponPort": "epon 0/4",
    "status": "offline",
    "rxPower": "-23.1 dBm",
    "customer": "Mbn@mahabulmia",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-189",
    "mac": "4c:f9:a4:39:0b:31",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-23.7 dBm",
    "customer": "Mbn@farzanadina",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-190",
    "mac": "4c:46:d1:1d:d0:44",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-21.2 dBm",
    "customer": "Mbn@khadizaakter",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-191",
    "mac": "4c:46:d1:98:0e:c3",
    "ponPort": "epon 0/3",
    "status": "offline",
    "rxPower": "-21.5 dBm",
    "customer": "Mbn@aminulislam",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-192",
    "mac": "00:31:92:ae:9f:89",
    "ponPort": "epon 0/4",
    "status": "online",
    "rxPower": "-22.9 dBm",
    "customer": "Mbn@anamat",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-193",
    "mac": "30:07:5c:75:cd:35",
    "ponPort": "epon 0/1",
    "status": "online",
    "rxPower": "-23.1 dBm",
    "customer": "Mbn@rohima",
    "oltServer": "OLT2"
  },
  {
    "id": "onu-netx-real-194",
    "mac": "3c:78:95:64:ff:bd",
    "ponPort": "epon 0/2",
    "status": "online",
    "rxPower": "-16.7 dBm",
    "customer": "Mbn@jalil",
    "oltServer": "OLT2"
  }
];
