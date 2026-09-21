'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { AdminRole, MaintenanceStatus, Priority } from '@prisma/client';

export async function seedErpDemoDataAction() {
  try {
    // 1. Seed Technicians
    const techCount = await prisma.technician.count();
    let techs: any[] = [];

    if (techCount === 0) {
      await prisma.technician.createMany({
        data: [
          { name: 'Karim Benali', email: 'k.benali@enterprise.com', phone: '0550 12 34 56', speciality: 'Maintenance Hardware & PC, Imprimantes & Consommables', role: 'Technicien en Informatique' },
          { name: 'Sofiane Mansouri', email: 's.mansouri@enterprise.com', phone: '0661 98 76 54', speciality: 'Reseaux & Commutateurs Cisco, Securite Informatique & Firewall', role: "Ingenieur d'Etat en Informatique" },
          { name: 'Amina Triki', email: 'a.triki@enterprise.com', phone: '0770 45 67 89', speciality: 'Systemes & Serveurs Linux/Win, Developpement & Bases de Donnees', role: 'Cadre Superieur IT / Responsable' },
          { name: 'Yacine Belkacem', email: 'y.belkacem@enterprise.com', phone: '0555 11 22 33', speciality: 'Maintenance Hardware & PC, Reseaux & Commutateurs Cisco', role: 'Technicien en Informatique' },
        ]
      });
    }
    techs = await prisma.technician.findMany({ orderBy: { name: 'asc' } });

    // 2. Seed IT Assets
    const assetCount = await prisma.iTAsset.count();
    if (assetCount === 0) {
      await prisma.iTAsset.createMany({
        data: [
          { assetTag: 'AST-2026-0001', name: 'PC Fixe HP ProDesk 400 G6', type: 'DESKTOP', brand: 'HP', model: 'ProDesk 400 G6', serialNumber: 'CNU0452X9A', unitType: 'FILIALE', unitName: 'Direction Generale Alger', service: 'Comptabilite', assignedTo: 'Ahmed Meziani', ipAddress: '192.168.1.45', status: 'OPERATIONAL' },
          { assetTag: 'AST-2026-0002', name: 'PC Portable Dell Latitude 5420', type: 'LAPTOP', brand: 'Dell', model: 'Latitude 5420', serialNumber: '7X8Y9Z3', unitType: 'CIC', unitName: 'CIC Oran', service: 'Ressources Humaines', assignedTo: 'Fatima Zohra', ipAddress: '192.168.10.12', status: 'OPERATIONAL' },
          { assetTag: 'AST-2026-0003', name: 'Imprimante Canon i-SENSYS LBP223dw', type: 'PRINTER', brand: 'Canon', model: 'LBP223dw', serialNumber: 'KJP09812', unitType: 'FILIALE', unitName: 'Direction Generale Alger', service: 'Secretariat', assignedTo: 'Partage', ipAddress: '192.168.1.200', status: 'DEFECTIVE' },
          { assetTag: 'AST-2026-0004', name: 'Serveur HP ProLiant DL380 Gen10', type: 'SERVER', brand: 'HPE', model: 'DL380 Gen10', serialNumber: 'SVR-ALGER-01', unitType: 'FILIALE', unitName: 'Direction Generale Alger', service: 'Data Center IT', assignedTo: 'Admin IT', ipAddress: '10.0.0.10', status: 'OPERATIONAL' },
          { assetTag: 'AST-2026-0005', name: 'Commutateur Cisco Catalyst 2960X', type: 'SWITCH_ROUTER', brand: 'Cisco', model: 'Catalyst 2960X', serialNumber: 'FCW2104A5', unitType: 'UPC', unitName: 'UPC Annaba Mill', service: 'Infrastructure Reseau', assignedTo: 'Support Reseau', ipAddress: '10.2.0.1', status: 'OPERATIONAL' },
          { assetTag: 'AST-2026-0006', name: 'Onduleur APC Smart-UPS 3000VA', type: 'UPS', brand: 'APC', model: 'Smart-UPS 3000', serialNumber: 'APC-991204', unitType: 'CIC', unitName: 'CIC Constantine', service: 'Salle Serveurs', assignedTo: 'Support IT', ipAddress: '192.168.20.250', status: 'UNDER_MAINTENANCE' },
          { assetTag: 'AST-2026-0007', name: 'PC Portable Lenovo ThinkPad E15', type: 'LAPTOP', brand: 'Lenovo', model: 'ThinkPad E15', serialNumber: 'LNV2023081', unitType: 'UPC', unitName: 'UPC Skikda Raffinage', service: 'Exploitation', assignedTo: 'Mourad Khaldi', ipAddress: '10.5.0.22', status: 'OPERATIONAL' },
          { assetTag: 'AST-2026-0008', name: 'Ecran Dell 24 P2422H', type: 'MONITOR', brand: 'Dell', model: 'P2422H', serialNumber: 'DL-MON-2024', unitType: 'CIC', unitName: 'CIC Annaba', service: 'Bureau des etudes', assignedTo: 'Sara Belaid', status: 'OPERATIONAL' },
        ]
      });
    }

    // 3. Seed Spare Parts
    const stockCount = await prisma.sparePart.count();
    let parts: any[] = [];
    if (stockCount === 0) {
      await prisma.sparePart.createMany({
        data: [
          { name: 'Disque SSD NVMe 512GB Kingston', partNumber: 'SNVS/512G', category: 'Stockage', quantity: 12, minThreshold: 3, unitPrice: 8500, location: 'Armoire A - Etagere 1' },
          { name: 'Barrette RAM DDR4 16GB Crucial', partNumber: 'CT16G4DFRA32A', category: 'Memoire', quantity: 8, minThreshold: 4, unitPrice: 6200, location: 'Armoire A - Etagere 2' },
          { name: 'Toner Canon CRG-054 Black', partNumber: 'CRG-054BK', category: 'Toners', quantity: 2, minThreshold: 5, unitPrice: 14500, location: 'Magasin Consommables' },
          { name: 'Toner HP LaserJet 85A CE285A', partNumber: 'CE285A', category: 'Toners', quantity: 15, minThreshold: 5, unitPrice: 4800, location: 'Magasin Consommables' },
          { name: 'Bloc Alimentation ATX 500W', partNumber: 'PSU-500W', category: 'Composants', quantity: 6, minThreshold: 2, unitPrice: 5500, location: 'Armoire B - Etagere 3' },
          { name: 'Cable Reseau RJ45 Cat6 3m', partNumber: 'RJ45-CAT6-3M', category: 'Cablage', quantity: 45, minThreshold: 10, unitPrice: 450, location: 'Armoire C' },
          { name: 'Pate Thermique Arctic Silver 5', partNumber: 'AS5-3.5G', category: 'Consommables', quantity: 20, minThreshold: 5, unitPrice: 650, location: 'Armoire A - Etagere 3' },
          { name: 'Cle USB 16GB Kingston', partNumber: 'DTSE9H/16GB', category: 'Stockage', quantity: 3, minThreshold: 5, unitPrice: 900, location: 'Tiroir Fournitures' },
        ]
      });
    }
    parts = await prisma.sparePart.findMany({ orderBy: { name: 'asc' } });

    // 4. Seed Knowledge Base
    const kbCount = await prisma.knowledgeArticle.count();
    if (kbCount === 0) {
      await prisma.knowledgeArticle.createMany({
        data: [
          { title: "Resolution blocage impression Canon/HP", category: 'Imprimante', problem: "L'imprimante affiche Erreur Spouleur ou n'imprime pas.", solution: "1. Ouvrir services.msc\n2. Arreter Spouleur impression\n3. Vider C:\\Windows\\System32\\spool\\PRINTERS\n4. Redemarrer le service.", tags: 'spouleur, impression, canon, hp', views: 42, author: 'Karim Benali' },
          { title: "Configuration adresse IP Fixe", category: 'Reseau', problem: "Perte de connexion reseau suite a un changement d'adressage.", solution: "1. Panneau de configuration > Centre Reseau\n2. Proprietes IPv4 > IP 192.168.1.X, Masque 255.255.255.0\n3. Passerelle 192.168.1.1, DNS: 8.8.8.8", tags: 'ip, reseau, gateway, dns', views: 28, author: 'Sofiane Mansouri' },
          { title: "Remplacement disque SSD et clonage Windows", category: 'Hardware', problem: 'Disque dur HDD tres lent ou defaillant SMART alert.', solution: "1. Brancher SSD via adaptateur USB-SATA\n2. Lancer Macrium Reflect\n3. Cloner partition Systeme C\n4. Remplacer physiquement le HDD.", tags: 'ssd, hdd, clonage, windows', views: 65, author: 'Amina Triki' },
          { title: 'Reinitialisation mot de passe Windows Admin local', category: 'Systeme', problem: "Utilisateur bloque — compte admin verrouille.", solution: "1. Demarrer depuis cle USB Windows PE\n2. Utiliser chntpw pour reinitialiser le mot de passe\n3. Redemarrer et redefinir depuis Windows.", tags: 'mot de passe, windows, admin', views: 38, author: 'Yacine Belkacem' },
          { title: 'Diagnostic et remplacement module RAM defaillant', category: 'Hardware', problem: 'PC redemarre avec ecrans bleus BSOD et erreurs memoire.', solution: "1. Lancer MemTest86 depuis USB bootable\n2. Identifier slot defaillant\n3. Remplacer la barrette RAM incriminee\n4. Relancer test post-remplacement.", tags: 'ram, bsod, memoire, memtest', views: 21, author: 'Karim Benali' },
        ]
      });
    }

    // 5. Seed Intervention Templates
    const tplCount = await prisma.interventionTemplate.count();
    if (tplCount === 0) {
      await prisma.interventionTemplate.createMany({
        data: [
          {
            name: 'تعطل شاشة العرض (Ecran Noir / Pas de signal)',
            category: 'Matériel informatique',
            equipment: 'Ecran Moniteur & Câbles HDMI/VGA',
            description: 'الشاشة لا تستجيب للتشغيل رغم تشغيل وحدة المعالجة المركزية، تم فحص كابل التغذية وتغيير منفذ HDMI دون جدوى.',
            priority: Priority.MEDIUM,
            solution: 'فحص بطاقة الشاشة، تجربة كابل بديل واختبار الشاشة على حاسوب آخر.',
            usageCount: 12,
          },
          {
            name: 'بطء حاد في النظام وتشنج مستمر (Disque 100%)',
            category: 'Logiciels & Systèmes',
            equipment: 'PC Fixe / Portable',
            description: 'نسبة استخدام القرص الصلب 100% في Task Manager وإقلاع النظام يستغرق أكثر من 5 دقائق.',
            priority: Priority.MEDIUM,
            solution: 'استبدال القرص الميكانيكي HDD بقرص SSD NVMe واستنساخ النظام.',
            usageCount: 18,
          },
          {
            name: 'فصل متكرر لشبكة الإنترنت والبريد الداخلي',
            category: 'Réseau & Câblage',
            equipment: 'Prise Réseau Murale RJ45 / Switch',
            description: 'انقطاع الاتصال بالسيرفر المركزي وقاعدة البيانات الداخلية مع وميض أحمر في كابل الشبكة.',
            priority: Priority.URGENT,
            solution: 'إعادة كبس موصل RJ45 وفحص مسار الكابل نحو السويتش.',
            usageCount: 9,
          },
        ]
      });
    }

    // 6. Seed Admin Users
    const userCount = await prisma.adminUser.count();
    if (userCount === 0) {
      const defaultHash = await bcrypt.hash('admin123', 10);
      await prisma.adminUser.createMany({
        data: [
          { username: 'superadmin', email: 'admin@entreprise.dz', fullName: 'المشرف العام للإعلام الآلي', role: AdminRole.SUPER_ADMIN, passwordHash: defaultHash },
          { username: 'karim.it', email: 'k.benali@entreprise.dz', fullName: 'كريم بن علي (مسؤول العتاد)', role: AdminRole.ADMIN, passwordHash: defaultHash },
          { username: 'sofiane.net', email: 's.mansouri@entreprise.dz', fullName: 'سفيان منصوري (مسؤول الشبكات)', role: AdminRole.TECHNICIAN_LEAD, passwordHash: defaultHash },
        ]
      });
    }

    // 7. Seed Preventive Maintenance
    const maintCount = await prisma.maintenanceSchedule.count();
    const allAssets = await prisma.iTAsset.findMany();
    if (maintCount === 0 && allAssets.length > 0) {
      const serverAsset = allAssets.find((a: any) => a.type === 'SERVER');
      const upsAsset = allAssets.find((a: any) => a.type === 'UPS');
      const techAmina = techs.find((t: any) => t.name === 'Amina Triki');
      const techSofiane = techs.find((t: any) => t.name === 'Sofiane Mansouri');

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 4);

      const inTwoWeeks = new Date();
      inTwoWeeks.setDate(inTwoWeeks.getDate() + 12);

      await prisma.maintenanceSchedule.createMany({
        data: [
          {
            title: 'صيانة دورية: تنظيف مبردات وفحص RAID لسيرفر البيانات',
            description: 'فحص مصفوفة الأقراص RAID 10، تنظيف فلاتر الغبار، وتطبيق التحديثات الأمنية لشهر أوت.',
            assetId: serverAsset?.id || null,
            technicianId: techAmina?.id || null,
            scheduledDate: nextWeek,
            intervalDays: 30,
            priority: Priority.URGENT,
            status: MaintenanceStatus.SCHEDULED,
          },
          {
            title: 'فحص وتفريغ بطاريات المموّل غير المنقطع (UPS 3000VA)',
            description: 'معايرة البطاريات، قياس الجهد الكهربائي، واختبار الانتقال التلقائي عند انقطاع التيار.',
            assetId: upsAsset?.id || null,
            technicianId: techSofiane?.id || null,
            scheduledDate: inTwoWeeks,
            intervalDays: 90,
            priority: Priority.MEDIUM,
            status: MaintenanceStatus.SCHEDULED,
          },
        ]
      });
    }

    // 8. Seed Intervention Tickets
    const ticketCount = await prisma.interventionTicket.count();
    if (ticketCount === 0) {
      const techKarim   = techs.find((t: any) => t.name === 'Karim Benali');
      const techSofiane = techs.find((t: any) => t.name === 'Sofiane Mansouri');
      const techAmina   = techs.find((t: any) => t.name === 'Amina Triki');
      const techYacine  = techs.find((t: any) => t.name === 'Yacine Belkacem');
      const now = new Date();
      const ago = (n: number) => new Date(now.getTime() - n * 86400000);

      const ticketsData: any[] = [
        { ticketNumber: 'DEM-2026-0001', fullName: 'Ahmed Meziani', functionTitle: 'Chef de Service Comptabilite', service: 'Comptabilite', phone: '0550 10 20 30', email: 'a.meziani@enterprise.com', managerName: 'M. Bouchama', unitType: 'FILIALE', unitName: 'Direction Generale Alger', category: 'Materiel informatique', equipment: 'PC Fixe HP ProDesk 400 G6', serialNumber: 'CNU0452X9A', ipAddress: '192.168.1.45', priority: 'URGENT', description: "PC ne demarre plus depuis ce matin. Ecran reste noir. Toutes les donnees comptables du trimestre sont dessus. Intervention urgente requise.", status: 'RESOLVED', interventionType: 'CURATIVE', technicianId: techKarim?.id || null, createdAt: ago(12), updatedAt: ago(11) },
        { ticketNumber: 'DEM-2026-0002', fullName: 'Fatima Zohra Belmehdi', functionTitle: 'Chargee RH', service: 'Ressources Humaines', phone: '0661 40 50 60', email: 'f.belmehdi@enterprise.com', managerName: 'Mme. Sadaoui', unitType: 'CIC', unitName: 'CIC Oran', category: 'Reseau & Connectivite', equipment: 'PC Portable Dell Latitude 5420', serialNumber: '7X8Y9Z3', ipAddress: '192.168.10.12', priority: 'MEDIUM', description: "Connexion reseau instable - deconnexion VPN toutes les 10 minutes. Impossible de travailler sur les applications SIRH. Probleme apparu apres la mise a jour reseau du 14/08.", status: 'IN_PROGRESS', interventionType: 'CURATIVE', technicianId: techSofiane?.id || null, createdAt: ago(5), updatedAt: ago(3) },
        { ticketNumber: 'DEM-2026-0003', fullName: 'Rachid Ouahrani', functionTitle: "Ingenieur d'Exploitation", service: 'Exploitation & Production', phone: '0770 33 44 55', email: 'r.ouahrani@enterprise.com', managerName: 'M. Ferhi', unitType: 'UPC', unitName: 'UPC Skikda Raffinage', category: 'Serveur & Infrastructure', equipment: 'Serveur HP ProLiant DL380 Gen10', serialNumber: 'SVR-ALGER-01', ipAddress: '10.0.0.10', priority: 'CRITICAL', description: "ALERTE CRITIQUE: Serveur de base de donnees production inaccessible depuis 06h00. Operations de raffinage bloquees. Disque RAID en etat DEGRADED. Perte de donnees possible.", status: 'PENDING', interventionType: 'CURATIVE', technicianId: null, createdAt: ago(1), updatedAt: ago(1) },
        { ticketNumber: 'DEM-2026-0004', fullName: 'Nour El Houda Aissaoui', functionTitle: 'Secretaire de Direction', service: 'Secretariat General', phone: '0550 77 88 99', email: 'n.aissaoui@enterprise.com', managerName: 'M. Directeur General', unitType: 'FILIALE', unitName: 'Direction Generale Alger', category: 'Imprimante & Consommables', equipment: 'Imprimante Canon i-SENSYS LBP223dw', serialNumber: 'KJP09812', ipAddress: '192.168.1.200', priority: 'MEDIUM', description: "Imprimante reseau ne repond plus. Documents bloques dans la file d'attente. Impression de notes officielles urgente pour reunion demain.", status: 'PENDING', interventionType: 'CURATIVE', technicianId: techKarim?.id || null, createdAt: ago(3), updatedAt: ago(3) },
        { ticketNumber: 'DEM-2026-0005', fullName: 'Omar Bensaid', functionTitle: 'Technicien Reseau', service: 'Infrastructure Reseau', phone: '0661 55 66 77', email: 'o.bensaid@enterprise.com', managerName: null, unitType: 'UPC', unitName: 'UPC Annaba Mill', category: 'Reseau & Connectivite', equipment: 'Commutateur Cisco Catalyst 2960X', serialNumber: 'FCW2104A5', ipAddress: '10.2.0.1', priority: 'URGENT', description: "Commutateur reseau principal ne repond plus au ping. 8 postes de travail sans connexion. Arret partiel supervision SCADA.", status: 'CLOSED', interventionType: 'CURATIVE', technicianId: techSofiane?.id || null, createdAt: ago(20), updatedAt: ago(18) },
        { ticketNumber: 'DEM-2026-0006', fullName: 'Hamid Bendjelloul', functionTitle: 'Agent Administratif', service: 'Administration Generale', phone: '0555 12 34 56', email: 'h.bendjelloul@enterprise.com', managerName: 'M. Aouine', unitType: 'CIC', unitName: 'CIC Constantine', category: 'Logiciel & Systeme', equipment: 'PC Fixe Dell OptiPlex 7090', serialNumber: 'DL-OPX-2023', ipAddress: '192.168.30.15', priority: 'LOW', description: "Le logiciel SIRH affiche une erreur lors de la saisie des conges. Probleme apparu apres la mise a jour Windows du 10/08/2026.", status: 'PENDING', interventionType: 'CURATIVE', technicianId: null, createdAt: ago(7), updatedAt: ago(7) },
        { ticketNumber: 'DEM-2026-0007', fullName: 'Amina Triki', functionTitle: 'Responsable IT', service: 'Informatique', phone: '0770 45 67 89', email: 'a.triki@enterprise.com', managerName: null, unitType: 'FILIALE', unitName: 'Direction Generale Alger', category: 'Maintenance Preventive', equipment: 'Onduleur APC Smart-UPS 3000VA', serialNumber: 'APC-991204', ipAddress: '192.168.20.250', priority: 'MEDIUM', description: "Maintenance preventive trimestrielle de l'onduleur. Test des batteries, MAJ firmware, nettoyage des filtres. Planifie Q3-2026.", status: 'IN_PROGRESS', interventionType: 'PREVENTIVE', technicianId: techAmina?.id || null, createdAt: ago(2), updatedAt: ago(1) },
        { ticketNumber: 'DEM-2026-0008', fullName: 'Mourad Khaldi', functionTitle: "Agent d'Exploitation", service: 'Exploitation', phone: '0770 98 76 54', email: 'm.khaldi@enterprise.com', managerName: 'Mme. Hadj Ali', unitType: 'UPC', unitName: 'UPC Skikda Raffinage', category: 'Materiel informatique', equipment: 'PC Portable Lenovo ThinkPad E15', serialNumber: 'LNV2023081', ipAddress: '10.5.0.22', priority: 'MEDIUM', description: "Ecran bleu BSOD aleatoire avec code MEMORY_MANAGEMENT. PC redemarre 2 a 3 fois par jour. Perte de travail non enregistre.", status: 'RESOLVED', interventionType: 'CURATIVE', technicianId: techYacine?.id || null, createdAt: ago(15), updatedAt: ago(14) },
      ];

      for (const t of ticketsData) {
        const createdTicket = await prisma.interventionTicket.create({ data: t });

        // Add demo internal comments
        if (t.ticketNumber === 'DEM-2026-0001') {
          await prisma.ticketComment.createMany({
            data: [
              { ticketId: createdTicket.id, author: 'Karim Benali', content: 'تم الفحص المبدئي وتبين أن القرص الصلب يصدر أصوات نقر متكررة.' },
              { ticketId: createdTicket.id, author: 'Karim Benali', content: 'تم جلب قرص SSD NVMe 512GB من المخزن لبدء عملية الاستنساخ.' },
            ],
          });
        }
      }

      // Reports for RESOLVED/CLOSED tickets
      const resolvedTickets = await prisma.interventionTicket.findMany({
        where: { status: { in: ['RESOLVED', 'CLOSED'] } },
        orderBy: { ticketNumber: 'asc' },
      });

      for (const ticket of resolvedTickets) {
        const existing = await prisma.interventionReport.findUnique({ where: { ticketId: ticket.id } });
        if (existing) continue;

        let report: any = null;

        if (ticket.ticketNumber === 'DEM-2026-0001') {
          report = { reportNumber: 'RPT-2026-0001', ticketId: ticket.id, technicianName: 'Karim Benali', diagnosis: "Panne materielle: disque HDD defaillant (SMART DANGER). Temperature CPU 95C due a poussiere.", actionsTaken: "1. Diagnostic SMART\n2. Clonage donnees sur SSD NVMe\n3. Remplacement HDD par SSD\n4. Nettoyage complet + pate thermique\n5. Tests stabilite OK", partsReplaced: 'Disque SSD NVMe 512GB Kingston, Pate thermique Arctic Silver 5', durationMinutes: 180, finalStatus: 'Resolu & Operationnel', completedAt: ago(11) };
        } else if (ticket.ticketNumber === 'DEM-2026-0005') {
          report = { reportNumber: 'RPT-2026-0002', ticketId: ticket.id, technicianName: 'Sofiane Mansouri', diagnosis: "Commutateur Cisco en panne totale - alimentation HS. Aucune LED active.", actionsTaken: "1. Diagnostic physique\n2. Remplacement commutateur\n3. Reconfiguration depuis backup TFTP\n4. Connectivite des 8 postes retablie\n5. SCADA OK", partsReplaced: 'Cable Reseau RJ45 Cat6 3m (x3)', durationMinutes: 120, finalStatus: 'Resolu & Operationnel', completedAt: ago(18) };
        } else if (ticket.ticketNumber === 'DEM-2026-0008') {
          report = { reportNumber: 'RPT-2026-0003', ticketId: ticket.id, technicianName: 'Yacine Belkacem', diagnosis: "Barrette RAM Slot 2 defaillante (5432 erreurs MemTest86). BSOD MEMORY_MANAGEMENT confirme.", actionsTaken: "1. MemTest86 complet\n2. Identification slot defaillant\n3. Remplacement RAM 8GB par DDR4 16GB Crucial\n4. 0 erreur post-test\n5. Stabilite 24h confirmee", partsReplaced: 'Barrette RAM DDR4 16GB 3200MHz Crucial', durationMinutes: 90, finalStatus: 'Resolu & Operationnel', completedAt: ago(14) };
        }

        if (report) {
          await prisma.interventionReport.create({ data: report });
        }
      }

      // Stock Movements
      const ssd   = parts.find((p: any) => p.partNumber === 'SNVS/512G');
      const paste  = parts.find((p: any) => p.partNumber === 'AS5-3.5G');
      const cable  = parts.find((p: any) => p.partNumber === 'RJ45-CAT6-3M');
      const ram    = parts.find((p: any) => p.partNumber === 'CT16G4DFRA32A');
      const t1 = resolvedTickets.find((t: any) => t.ticketNumber === 'DEM-2026-0001');
      const t5 = resolvedTickets.find((t: any) => t.ticketNumber === 'DEM-2026-0005');
      const t8 = resolvedTickets.find((t: any) => t.ticketNumber === 'DEM-2026-0008');

      if (ssd && t1)   { await prisma.stockMovement.create({ data: { sparePartId: ssd.id,  movementType: 'OUT', quantity: 1, reason: 'Remplacement disque - DEM-2026-0001',     ticketId: t1.id, performedBy: 'Karim Benali'    } }); await prisma.sparePart.update({ where: { id: ssd.id  }, data: { quantity: { decrement: 1 } } }); }
      if (paste && t1) { await prisma.stockMovement.create({ data: { sparePartId: paste.id, movementType: 'OUT', quantity: 1, reason: 'Pate thermique CPU - DEM-2026-0001',       ticketId: t1.id, performedBy: 'Karim Benali'    } }); await prisma.sparePart.update({ where: { id: paste.id }, data: { quantity: { decrement: 1 } } }); }
      if (cable && t5) { await prisma.stockMovement.create({ data: { sparePartId: cable.id, movementType: 'OUT', quantity: 3, reason: 'Cables remplacement switch - DEM-2026-0005', ticketId: t5.id, performedBy: 'Sofiane Mansouri' } }); await prisma.sparePart.update({ where: { id: cable.id }, data: { quantity: { decrement: 3 } } }); }
      if (ram && t8)   { await prisma.stockMovement.create({ data: { sparePartId: ram.id,  movementType: 'OUT', quantity: 1, reason: 'Remplacement RAM - DEM-2026-0008',           ticketId: t8.id, performedBy: 'Yacine Belkacem'  } }); await prisma.sparePart.update({ where: { id: ram.id  }, data: { quantity: { decrement: 1 } } }); }
    }

    // 7. Seed Sample Decharges
    const dechargeCount = await prisma.equipmentDecharge.count();
    if (dechargeCount === 0) {
      await prisma.equipmentDecharge.create({
        data: {
          dechargeNumber: 'DCH-2026-0001',
          beneficiaryName: 'Ahmed Meziani',
          functionTitle: 'Chef de Service Comptabilité',
          department: 'Direction Financière',
          matricule: 'EMP-1042',
          phone: '0555 23 45 67',
          email: 'a.meziani@enterprise.com',
          unitType: 'FILIALE',
          unitName: 'Direction Générale Alger',
          dischargeType: 'PERMANENT',
          dischargeDate: new Date('2026-01-15T09:00:00Z'),
          technicianName: 'Karim Benali',
          status: 'ACTIVE',
          notes: 'Matériel remis neuf avec accessoires complets pour le poste de travail.',
          items: {
            create: [
              {
                equipmentName: 'PC Fixe HP ProDesk 400 G6',
                category: 'DESKTOP',
                brand: 'HP',
                model: 'ProDesk 400 G6',
                serialNumber: 'CNU0452X9A',
                assetTag: 'AST-2026-0001',
                condition: 'BON_ETAT',
                accessories: 'Câble alimentation, Clavier & Souris USB',
              },
            ],
          },
        },
      });

      await prisma.equipmentDecharge.create({
        data: {
          dechargeNumber: 'DCH-2026-0002',
          beneficiaryName: 'Fatima Zohra',
          functionTitle: 'Chargée de Recrutement',
          department: 'Ressources Humaines',
          matricule: 'EMP-2089',
          phone: '0661 12 34 56',
          email: 'f.zohra@enterprise.com',
          unitType: 'CIC',
          unitName: 'CIC Oran',
          dischargeType: 'TEMPORARY',
          dischargeDate: new Date('2026-02-01T10:00:00Z'),
          expectedReturnDate: new Date('2026-04-01T18:00:00Z'),
          technicianName: 'Sofiane Mansouri',
          status: 'ACTIVE',
          notes: 'Mise à disposition pour mission d\'audit régional.',
          items: {
            create: [
              {
                equipmentName: 'PC Portable Dell Latitude 5420',
                category: 'LAPTOP',
                brand: 'Dell',
                model: 'Latitude 5420',
                serialNumber: '7X8Y9Z3',
                assetTag: 'AST-2026-0002',
                condition: 'BON_ETAT',
                accessories: 'Sacoche Dell originale, Chargeur USB-C 65W, Souris optique',
              },
            ],
          },
        },
      });
    }

    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/tickets');
    revalidatePath('/admin/maintenance');
    revalidatePath('/admin/assets');
    revalidatePath('/admin/decharges');
    revalidatePath('/admin/stock');
    revalidatePath('/admin/reports');
    revalidatePath('/admin/technicians');
    revalidatePath('/admin/knowledge');
    revalidatePath('/admin/templates');
    revalidatePath('/admin/users');

    return { success: true };
  } catch (error: any) {
    console.error('Error seeding ERP demo data:', error);
    return { success: false, error: error.message };
  }
}
