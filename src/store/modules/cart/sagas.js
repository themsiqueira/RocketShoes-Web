import { call, select, put, all, takeLatest } from 'redux-saga/effects';
import { toast } from 'react-toastify';
import { formatPrice } from '../../../util/format';
import api from '../../../services/api';
import history from '../../../services/history';

import { addToCartSucess, updateAmountSucess } from './actions';

function* addToCart({ id }) {
  const productExists = yield select(state =>
    state.cart.find(p => p.id === id)
  );

  const stock = yield call(api.get, `/stock/${id}`);

  const stockAmount = stock.data.amount;
  const currentAmount = productExists ? productExists.amount : 0;

  const amount = currentAmount + 1;

  if (amount > stockAmount) {
    toast.error('Product without stock');
    return;
  }

  if (productExists) {
    yield put(updateAmountSucess(id, amount));
  } else {
    const response = yield call(api.get, `/products/${id}`);

    const data = {
      ...response.data,
      amount: 1,
      priceFormatted: formatPrice(response.data.price),
    };

    yield put(addToCartSucess(data));
    history.push('/cart');
  }
}

function* updateAmount(action) {
  if (action.payload.amount <= 0) return;

  const stock = yield call(api.get, `/stock/${action.payload.id}`);
  const stockAmount = stock.data.amount;

  if (action.payload.amount > stockAmount) {
    toast.error('Product without stock');
    return;
  }

  yield put(updateAmountSucess(action.payload.id, action.payload.amount));
}

export default all([
  takeLatest('@cart/ADD_REQUEST', addToCart),
  takeLatest('@cart/UPDATE_AMOUNT_REQUEST', updateAmount),
]);
