const INITIAL_CODE = `import {Logger} from '../../Logger';

const logger = new Logger();

//Parameters must be methods
async function connect(requestLogin, requestWebView) {
  const { username, password } = await requestLogin();

  logger.log('info', 'hello world')
  logger.log('debug', {username, password})

  return {
    username,
    password,
  };
}

//Clear state after completion, this can often be left empty
function disconnect() {
  return {};
}

//Using State retrieved from login fetch data 
async function collect(state, { logWarning }) {
  return { activities: [], state };
}

//Configure how your integration is displayed
const config = {
  label: '',
  description: '',
  country: '', //i.e. DK, UK, etc
  isPrivate: true,
  type: null,
};`;

export default INITIAL_CODE;
