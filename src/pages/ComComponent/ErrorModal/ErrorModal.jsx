import styles from "./ErrorModal.module.scss";
import ReactDOM from "react-dom";

const Backdrop = (props) => {
  return <div className={styles.backdrop} onClick={props.onClick} />;
};

function Confirmation(props) {
  return (
    <div className={styles.modal}>
      <h2>ERROR</h2>
      {props.text}
      <div className={styles.close} onClick={props.onClick}>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className={styles.loadingmodal}>
      <h2>Loading...</h2>
    </div>
  );
}

function ErrorModal({ children, onClick, isLoading = false }) {
  return (
    <>
      {isLoading ? (
        ReactDOM.createPortal(
          <Loading onClick={onClick} />,
          document.getElementById("modal-root")
        )
      ) : (
        <>
          {ReactDOM.createPortal(
            <Backdrop onClick={onClick} />,
            document.getElementById("backdrop-root")
          )}
          {ReactDOM.createPortal(
            <Confirmation onClick={onClick} text={children} />,
            document.getElementById("modal-root")
          )}
        </>
      )}
    </>
  );
}

export default ErrorModal;
