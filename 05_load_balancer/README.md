# Opis
- systemy leżące w dwóch regionach - rysunek infrastruktury przedstawiony na zajęciach
- 2x MIG wpięte do Load Balancera globalnego
- wykorzystamy LB podłączony Cloud Armor
	- ochrona przed OWASP top 10
	- możliwości black listy IP


# 1. Tworzenie sieci
Potrzebne dwie podsieci w różnych częściach świata
1. jeśli istnieją podsieci zadania [[szkolenie GCP - 2.1 - lab Hub & Spoke]], wystarczy dodać podsieć w regionie us-central1
2. W przeciwnym wypadku utworzyć nowe podsieci

nazwa|region|adresacja
-|-|-
sbn-front-usc|us-central1|10.0.3.0/24
sbn-front-eu|europe-central2|10.0.2.0/24


# 2. Utworzenie dwóch MIG
1. Utworzyć 2 szablony (nowy *Instance Template*) dla us-central1 i europe-central2 
	1. Dla ułatwienia nazwa powinna zawierać region (template-usc, template-eu)
	2. Większość ustawień domyślna
	3. Rozwinąć **Networking, Disks, Security, Management, Sole-tenancy**
		1. *Networking*
			1. network tag: frontserver 
			2. *Network interfaces > Subnetwork*
				1. usunąć podsieć "default"
				2. wybrać podsieć "sbn-front-x" zgodną z geologalizacją
		2. *Management* > *Metadata* > **Add item**
			1. `startup-script-url` : `gs://cloud-training/gcpnet/httplb/startup.sh`
	4. **Create**
2. Utworznie 2x Instance Group na podstawie szablonów
	1. Wybrać region zgodnie z poprzednimi wyborami podsieci
	2. *Instance Template* - wybrać wcześniej stworzony szablon
	3. **Maximum number of instances:** 5
	4. Autoscaling -> HTTP load balancing utilization: 25%
	5. **Cool down period**: 45 
	6. **Create**
3. Dla sprawdzenia wejść przez External IP na jedną z maszyn w dowolnej IG. Maszyna powinna być dostępna z Internetu z uwagi na *network tag* "frontserver". Jeśli maszyna nie jest dostępna dodaj odpowiednie reguły firewall.

# 3. Dodanie globalnego Load Balancer-a
1. *Network services > Load Balancing*
2. **Create Load Balancer**
3. HTTP(S) Load Balancing > **Start configuration**
4. W następnym widoku wartości domyślne
	1. *From Internet to my VMs...*
	2. Classic HTTP(S) Load Balancer
5. Konfiguracja LB
	1. Backend configurataion > **Create a backend service** 
		1. podać dwa backendy z obu naszych regionów
			1. Port numbers: 80
			2. Balancing mode: Rate - 20 RPS per instance
		2. *Health Check* -> dodać dowolny
		3. Security -> na razie zostawiamy puste
	2. Frontend configuration: 
		1. **Protocol:** HTTP
		2. **Port:** 80
	3. Host and path rules: simple
6. **Zatwierdzić** i poczekać na utworzenie. Load Balancer będzie działał po kilku minutach.


# 4. Testowanie
1. Wejść na zewnętrzny adres IP load balancera (domyślnie trafiamy na najbliższy serwer z backend)
2. Dodać VM w regionie us-west1 
	1. nazwa: vm-siege
	2. typu e2-standard-4
	3. VPC: default
	4. Allow HTTP/S traffic
3. Podłączyć się do nowo utworzonej VM przez SSH
4. `sudo apt-get -y install siege`
5. stworzyć zmienną środowiskową z adresem Load Balancer-a `export LB=http://{external_ip_Load_Balancera}`
6. `curl $LB`
7. `siege -c 250 $LB` (wysłanie 250 równoległych request-ów do LB)
8. Przejrzeć *Monitoring* dla Load Balancera
9. Po wyłączeniu *siege* liczba instacji w Instance Group powinna wrócić do 1 szt.


# 5. Zabezpiecznie Load Balancer-a
1. Sprawdzić i zapamiętać/skopiować adres IP maszyny "vm-siege" z poprzedniego ćwiczenia. 
    > Można wykonać polecenie `curl http://ipecho.net/plain` będąc podłączonym do "vm-siege".
3. *Network Security > Cloud Armor*
4. **Create policy**
5. Configure policy
	1. Nazwa: siege-defender
	2. Reguła domyślna: **Allow**
6. Add more rules
	1. Wkleić adres IP VM służącej do testowania
	2. **Deny**
7. **Create policy**
8. Przejść do wcześniej utworzeonego Lad Balancer-a (*Network services > Load Balancing*) i wyedytować
9. Edytować *Backend configuration* > *Security* i wybrać politykę
10. Przetestować z VM testowej za pomocą polecenia `curl $LB`
