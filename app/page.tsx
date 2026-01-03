'use client';

import { Frame, TaskBar, List } from '@react95/core';
import { Computer } from '@react95/icons';

export default function HomePage() {
  return (
    <div
      style={{
        height: '100vh',
        background: 'linear-gradient(135deg, #008080 0%, #004d4d 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: '20px',
          overflow: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Frame width="500px" height="auto" padding={30} boxShadow="in">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              marginBottom: '20px',
            }}
          >
            <Computer variant="32x32_4" />
            <div>
              <h1 style={{ margin: 0, fontSize: '32px', color: '#000080' }}>
                RetrOmmerce
              </h1>
              <p style={{ margin: '5px 0 0 0', fontSize: '16px' }}>
                Tu tienda de tecnología vintage de los 90s y 2000s
              </p>
            </div>
          </div>

          <p style={{ lineHeight: '1.6' }}>
            ¡Bienvenido al pasado! Encuentra computadoras, procesadores,
            memorias RAM, monitores CRT y más componentes clásicos en perfecto
            estado de funcionamiento.
          </p>
        </Frame>
      </div>

      {/* TaskBar */}
      <TaskBar
        list={
          <List>
            <List.Item icon={<Computer variant="32x32_4" />}>
              Retrommerce
            </List.Item>
          </List>
        }
      />
    </div>
  );
}
