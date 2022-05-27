# System layers with restrictions

## Opis

Kolejne warstwy systemu zostaną udostępnione w jednej VPC oraz zabezpieczone regułami Firewall:

- Frontend - dostępne z internetu i z Cloud Shell (zakładamy, że tam działa aplikacja webowa)
- Backend - dostępne tylko z Frontendu, wyjśnie na Internet możliwe (zakładamy, że tam działa backend naszej aplikacji)
- Data - wyjście i wejście na internet nie możliwe, dostępne tylko z Backendu (zakładamy, że to warstawa bazodanowa aplikacji)

---

## Krok 1. Utworzenie sieci

1. *Networking > VPC Network* > **Create VPC network** (sieć default ignorujemy)
2. Większość ustawień pozostawić bez zmian
4. Utworzyć subnety (podsieci) dla każdej warstwy
	1. sbn-data-eu: 10.0.0.0/24; region: europe-central2
	2. sbn-back-eu: 10.0.1.0/24; region: europe-central2
	3. sbn-front-eu: 10.0.2.0/24; region: europe-central2
6. *Create*


## Krok 2. Dodanie VM

1. *Compute Engine > VM instances*
2. Utworzyć trzy VM dla każdej warstwy systemu:
	1.  Region: europe-central2
	1. **Networking, disks, security, management, sole-tenancy**
        1. Usuń sieć `default`
        1. Przejdź do sekcji *Networking > Network tags* i dodaj subnet i tag zgodnie z przeznaczeniem:

            vm name|network tag|subnet
            -|-|-
            vm-data-eu|dataserver|sbn-data-eu
            vm-back-eu|backserver|sbn-back-eu
            vm-front-eu|frontserver|sbn-front-eu


## Krok 3. Reguły Firewall
1. Zweryfikować aktualne reguły firewall-a -> połączyć się przez publiczny IP do każdej maszyny
2. Przejdź do reguł Firewall (_Navigation menu_ > _Networking_ > _VPC Network_ > *Firewall*
3. Utwórz trzy nowe reguły firewall klikając *Create firewall rule*. _Target_ dla każdej reguły ustaw na "Specified target tags".

    name | priority | Target tags | Source IPv4 ranges / Source tags | Protocols and ports
    --- | --- | --- | --- | ---
    allow-ssh-debug | 1000 | frontserver, backserver, dataserver | 0.0.0.0/0 | tcp/22
    back-allow-front-icmp | 1001 | backserver | frontserver | icmp
    data-allow-back-icmp | 1002 | dataserver | backserver | icmp

## Krok 4. Sprawdzenie łączności

1. Połącz się po `ssh` do serwera front
1. Wykonaj polecenie `ping` do `vm-back-eu` i `vm-data-eu` po ich Internal IP