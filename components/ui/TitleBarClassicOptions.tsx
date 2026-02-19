import { TitleBar, Cursor } from "@react95/core";

export default function TitlebarOptionsAuto() {
  return (
    <TitleBar.OptionsBox>
      <TitleBar.Minimize className={Cursor.Auto} />
      <TitleBar.Restore className={Cursor.Auto} />
      <TitleBar.Close className={Cursor.Auto} />
    </TitleBar.OptionsBox>
  );
}
