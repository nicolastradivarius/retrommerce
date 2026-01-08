import { Frame, TitleBar, Button } from '@react95/core';
import { Computer3, Warning } from '@react95/icons';
import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <div className={styles.window}>
        <TitleBar 
          active 
          icon={<Computer3 variant="16x16_4" />}
          title="Error 404 - Página no encontrada"
        />
        <Frame className={styles.windowContent}>
          <div className={styles.errorContent}>
            <div className={styles.iconSection}>
              <Warning variant="32x32_4" />
            </div>
            <div className={styles.messageSection}>
              <p className={styles.errorTitle}>
                No se puede encontrar la página solicitada.
              </p>
              <p className={styles.errorMessage}>
                La página que busca puede haber sido eliminada, 
                cambiado de nombre o no está disponible temporalmente.
              </p>
              <p className={styles.errorCode}>
                Código de error: HTTP 404 - Archivo no encontrado
              </p>
            </div>
          </div>
          
          <div className={styles.separator} />
          
          <div className={styles.actions}>
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </div>
        </Frame>
      </div>
    </div>
  );
}
