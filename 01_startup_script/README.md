# Tworzenie maszyny wirtualnej ze skryptem startowym

---

## Krok 1: Utwórz maszynę wirtualną ze skryptem startowym

1. Przejdź do tworzenia maszyny wirtualnej (_Navigation Menu_ > _Compute Engine_ > _VM instances_ > _+ Create Instance_)
2. Utwórz maszynę wirtualną zgodnie z poniższymi regułami:

    - Na ekranie tworzenia maszyny wirtualnej pozostaw wszystkie wartości domyślne. 
    - W sekcji _Firewall_ zaznacz checkbox obok opcji _Allow HTTP traffic_. 
    - Rozwiń dalszą część menu tworzenia maszyny klikając _Networking, Disks, Security, Management, Sole-tenancy_.
    - W sekcji _Management_ > _Automation_ podaj poniższy skrypt:

        ```bash
        #! /bin/bash
        apt update
        apt -y install apache2
        cat <<EOF > /var/www/html/index.html
        <html><body><p>Startup script installed Apache 2 and exposed this page automatically.</p></body></html>
        ```

1. Kliknij _Create_

## Krok 2: Wyświetl stronę udostępnianą przez maszynę wirtualną

1. Po utworzeniu maszyny wirtualnej znajdź jej publiczny adres IP (inny niż `10.*.*.*`)
1. Wklej adres IP w przeglądarce i wyświetl stronę. **Upewnij się, że łączysz się po HTTP, nie HTTPs**