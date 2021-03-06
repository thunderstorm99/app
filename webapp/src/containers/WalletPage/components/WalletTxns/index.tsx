import React, { useState, useEffect } from 'react';
import { Card, Table, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import styles from './WalletTxns.module.scss';
import { I18n } from 'react-redux-i18n';
import { fetchWalletTxnsRequest } from '../../reducer';
import { WALLET_TXN_PAGE_SIZE } from '../../../../constants';
import Pagination from '../../../../components/Pagination';
import { getAmountInSelectedUnit } from '../../../../utils/utility';
import { BLOCKCHAIN_BLOCK_BASE_PATH } from '../../../../constants';

interface WalletTxnsProps {
  unit: string;
  walletTxns: {
    txnId: string;
    category: string;
    time: string;
    amount: number;
    unit: string;
    height: number;
  }[];
  walletTxnCount: number;
  fetchWalletTxns: (
    currentPage: number,
    pageSize: number,
    intialLoad?: boolean
  ) => void;
  stopPagination: boolean;
}

const WalletTxns: React.FunctionComponent<WalletTxnsProps> = (
  props: WalletTxnsProps
) => {
  const [currentPage, handlePageChange] = useState(1);
  const pageSize = WALLET_TXN_PAGE_SIZE;
  const { walletTxnCount: total, walletTxns, stopPagination } = props;

  useEffect(() => {
    props.fetchWalletTxns(currentPage, pageSize, true);
  }, []);

  const getTxnsTypeIcon = (type: string) => {
    if (type === 'send') {
      return <MdArrowUpward className={styles.typeIcon} />;
    }
    return <MdArrowDownward className={styles.typeIcon} />;
  };

  const fetchData = (pageNumber: number) => {
    props.fetchWalletTxns(pageNumber, pageSize);
    handlePageChange(pageNumber);
  };

  const pagesCount = Math.ceil(total / pageSize);
  const from = (currentPage - 1) * pageSize;
  const to = Math.min(total, currentPage * pageSize);

  return (
    <section className='mb-5'>
      <h2>{I18n.t('containers.wallet.walletPage.transactions')}</h2>
      {pagesCount ? (
        <>
          <Card className={`${styles.card} table-responsive-md`}>
            <Table className={styles.table}>
              <thead>
                <tr>
                  <th></th>
                  <th>{I18n.t('containers.wallet.walletTxns.height')}</th>
                  <th>{I18n.t('containers.wallet.walletTxns.time')}</th>
                  <th className={styles.amount}>
                    {I18n.t('containers.wallet.walletTxns.amount')}
                  </th>
                  <th>{I18n.t('containers.wallet.walletTxns.hash')}</th>
                </tr>
              </thead>
              <tbody>
                {walletTxns.map((txn, index) => (
                  <tr key={`${txn.txnId}-${index}`}>
                    <td className={styles.typeIcon}>
                      {getTxnsTypeIcon(txn.category)}
                    </td>
                    <td>
                      {txn.height !== -1 ? (
                        <Link
                          to={`${BLOCKCHAIN_BLOCK_BASE_PATH}/${txn.height}`}
                        >
                          {txn.height}
                        </Link>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <div className={styles.time}>{txn.time}</div>
                    </td>
                    <td>
                      <div className={styles.amount}>
                        {getAmountInSelectedUnit(
                          txn.amount,
                          props.unit,
                          txn.unit
                        )}
                        &nbsp;
                        <span className={styles.unit}>{props.unit}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.hash}>{txn.txnId}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
          <Pagination
            label={I18n.t('containers.wallet.walletPage.paginationRange', {
              to,
              total,
              from: from + 1,
            })}
            currentPage={currentPage}
            pagesCount={pagesCount}
            handlePageClick={fetchData}
            showNextOnly
            disableNext={stopPagination}
          />
        </>
      ) : (
        <Card className='table-responsive-md'>
          <CardBody>
            {I18n.t('containers.wallet.walletTxns.noTransactions')}
          </CardBody>
        </Card>
      )}
    </section>
  );
};

const mapStateToProps = (state) => {
  const { settings, wallet } = state;
  return {
    unit: settings.appConfig.unit,
    walletTxns: wallet.walletTxns,
    walletTxnCount: wallet.walletTxnCount,
    stopPagination: wallet.stopPagination,
  };
};

const mapDispatchToProps = {
  fetchWalletTxns: (currentPage, pageSize, intialLoad) =>
    fetchWalletTxnsRequest({ currentPage, pageSize, intialLoad }),
};

export default connect(mapStateToProps, mapDispatchToProps)(WalletTxns);
