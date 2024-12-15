const Modal = ({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) => (
  <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
      <p className="text-lg font-medium text-black">{message}</p>
      <button
        onClick={onClose}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
        Close
      </button>
    </div>
  </div>
);

export default Modal;
