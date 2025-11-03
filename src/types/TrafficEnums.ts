// Tipos de protocolo de red
export enum TipoProtocolo {
  // Web
  WEB_SERVER = "WEB_SERVER",              // HTTP
  WEB_SERVER_SSL = "WEB_SERVER_SSL",      // HTTPS
  
  // Email
  EMAIL_SERVER = "EMAIL_SERVER",           // SMTP/POP3/IMAP
  EMAIL_SERVER_SSL = "EMAIL_SERVER_SSL",   // SMTPS/POP3S/IMAPS
  
  // Administración remota
  TELNET = "TELNET",                       
  SSH = "SSH",                             
  
  // Transferencia de archivos
  FTP = "FTP",                             
  
  // Bases de datos
  DATABASE = "DATABASE",                   // SQL Server, MySQL, PostgreSQL
  
  // Directorio
  LDAP = "LDAP",                          
  LDAP_SSL = "LDAP_SSL",                  
  
  // Defensa (específicos del juego)
  DEFENSE_RAT = "DEFENSE_RAT",
  DEFENSE_4T = "DEFENSE_4T",
  
  // VPN
  VPN_GATEWAY = "VPN_GATEWAY",            // IPSec, SSL VPN
  
  // Servicios corporativos
  REPORTING = "REPORTING",                 // Logs, telemetría
  MANAGEMENT = "MANAGEMENT",               // Gestión remota
  NETWORK_FILE_SERVICE = "NETWORK_FILE_SERVICE", // NFS, SMB/CIFS
  MESSAGING = "MESSAGING"                  // Chat corporativo
}

// Información básica de un protocolo
 
export interface ProtocoloInfo {
  tipo: TipoProtocolo;
  puerto: number;
}

// Registro de tráfico de red
export interface RegistroTrafico {
  origen: string;
  destino: string;
  protocolo: TipoProtocolo;
}

// Catálogo de protocolos con sus puertos

export const PROTOCOLOS: Record<TipoProtocolo, ProtocoloInfo> = {
  [TipoProtocolo.WEB_SERVER]: {
    tipo: TipoProtocolo.WEB_SERVER,
    puerto: 80
  },
  [TipoProtocolo.WEB_SERVER_SSL]: {
    tipo: TipoProtocolo.WEB_SERVER_SSL,
    puerto: 443
  },
  [TipoProtocolo.EMAIL_SERVER]: {
    tipo: TipoProtocolo.EMAIL_SERVER,
    puerto: 25
  },
  [TipoProtocolo.EMAIL_SERVER_SSL]: {
    tipo: TipoProtocolo.EMAIL_SERVER_SSL,
    puerto: 465
  },
  [TipoProtocolo.TELNET]: {
    tipo: TipoProtocolo.TELNET,
    puerto: 23
  },
  [TipoProtocolo.SSH]: {
    tipo: TipoProtocolo.SSH,
    puerto: 22
  },
  [TipoProtocolo.FTP]: {
    tipo: TipoProtocolo.FTP,
    puerto: 21
  },
  [TipoProtocolo.DATABASE]: {
    tipo: TipoProtocolo.DATABASE,
    puerto: 3306
  },
  [TipoProtocolo.LDAP]: {
    tipo: TipoProtocolo.LDAP,
    puerto: 389
  },
  [TipoProtocolo.LDAP_SSL]: {
    tipo: TipoProtocolo.LDAP_SSL,
    puerto: 636
  },
  [TipoProtocolo.DEFENSE_RAT]: {
    tipo: TipoProtocolo.DEFENSE_RAT,
    puerto: 9000
  },
  [TipoProtocolo.DEFENSE_4T]: {
    tipo: TipoProtocolo.DEFENSE_4T,
    puerto: 9001
  },
  [TipoProtocolo.VPN_GATEWAY]: {
    tipo: TipoProtocolo.VPN_GATEWAY,
    puerto: 1194
  },
  [TipoProtocolo.REPORTING]: {
    tipo: TipoProtocolo.REPORTING,
    puerto: 514
  },
  [TipoProtocolo.MANAGEMENT]: {
    tipo: TipoProtocolo.MANAGEMENT,
    puerto: 161
  },
  [TipoProtocolo.NETWORK_FILE_SERVICE]: {
    tipo: TipoProtocolo.NETWORK_FILE_SERVICE,
    puerto: 445
  },
  [TipoProtocolo.MESSAGING]: {
    tipo: TipoProtocolo.MESSAGING,
    puerto: 5222
  }
};
