export const MyCheckboxes = () => {
  return (
    <fieldset className="pb-5">
      <div className="flex items-center mb-4">
        <input
          checked
          type="checkbox"
          value=""
          className="w-4 h-4 text-blue-600 bg-gray-100 border-teal-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          I agree to the
          <a
            href="#"
            className="text-blue-600 hover:underline dark:text-blue-500"
          >
            terms and conditions
          </a>
          .
        </label>
      </div>

      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          value=""
          className="w-4 h-4 text-blue-600 bg-gray-100 border-teal-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          I want to get promotional offers
        </label>
      </div>

      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          value=""
          className="w-4 h-4 text-blue-600 bg-gray-100 border-teal-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
          I am 18 years or older
        </label>
      </div>

      <div className="flex mb-4">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            value=""
            className="w-4 h-4 text-blue-600 bg-gray-100 border-teal-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div className="ms-2 text-sm">
          <label className="font-medium text-gray-900 dark:text-gray-300">
            Free shipping via Flowbite
          </label>
          <p className="text-xs font-normal text-gray-500 dark:text-gray-400">
            For orders shipped from $25 in books or $29 in other categories
          </p>
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          value=""
          className="w-4 h-4 border-teal-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800"
          disabled
        />
        <label className="ms-2 text-sm font-medium text-gray-400 dark:text-gray-500">
          Eligible for international shipping (disabled)
        </label>
      </div>
    </fieldset>
  );
};
