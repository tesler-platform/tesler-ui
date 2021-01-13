/**
 * Функционал который надо запускать перед каждым тестом
 */
import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

// Здесь возможно надо будет сделать чтобы возвращался createMemoryHistory вместо createBrowserHistory
jest.mock('history')

// Это возможно надо будет вынести, чтобы тесты без jsx зазря не тащили реакт
configure({ adapter: new Adapter() })
