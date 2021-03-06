import React, { useState } from 'react';
import CommandsBar from './components/CommandBars';
import Body from './components/Body';
import { IntlProvider } from 'react-intl';
import { EditorContext } from './utils/contexts';

const locale: string = sessionStorage.getItem('language');
const messages = JSON.parse(sessionStorage.getItem('messages'));

console.log(sessionStorage.getItem('messages'));
console.log(messages);

if (!sessionStorage.getItem('loaded')) {
  sessionStorage.setItem('loaded', String(true));
  location.reload();
}

function App(): JSX.Element {
  // This array stores namespace Id
  const [fileHistory, setFileHistory] = useState<string[]>([]);
  const [openingTab, setOpeningTab] = useState<string>(null);
  const [openingTabType, setOpeningTabType] = useState<string>('');
  return (
    <IntlProvider messages={messages} locale={locale} defaultLocale="en">
      <EditorContext.Provider
        value={{ fileHistory, setFileHistory, openingTab, setOpeningTab, openingTabType, setOpeningTabType }}
      >
        <CommandsBar />
        <Body />
      </EditorContext.Provider>
    </IntlProvider>
  );
}

export default App;
