export interface Theme{
  title: string;
  theme: {
    bg: string;
    txt: string;
    bgNav: string;
    txtNav: string;
  }
}

const Themes = {
  dark: {
    title: 'dark',
    theme: {
      bg: '#191c24',
      txt: '#efefef',
      bgNav: '#101218',
      txtNav: '#efefef'
    }
  } as Theme,
  light: {
    title: 'light',
    theme: {
      bg: '#ffffff',
      txt: '#0f1522',
      bgNav: '#efefef',
      txtNav: '#0f1522'
    }
  } as Theme,
  black: {
    title: 'black',
    theme: {
      bg: '#000000',
      txt: '#efefef',
      bgNav: '#000000',
      txtNav: '#efefef'
    }
  } as Theme
}

const setTheme = (t: Theme) => {
  const theme = t.theme;

  document.documentElement.style.setProperty('--bg', theme.bg);
  document.documentElement.style.setProperty('--txt', theme.txt);
  document.documentElement.style.setProperty('--bg-nav', theme.bgNav);
  document.documentElement.style.setProperty('--txt-nav', theme.txtNav);
}

export {Themes, setTheme};