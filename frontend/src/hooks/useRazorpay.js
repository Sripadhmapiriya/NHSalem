import { useState } from 'react'
import useToastStore from '@/store/toastStore'
import { loadRazorpayScript, createRazorpayOrder, verifyRazorpayPayment } from '@/services/payment'

export default function useRazorpay() {
  const [loading, setLoading] = useState(false)
  const { addToast } = useToastStore()

  const initiatePayment = async ({
    amount,          // in rupees
    name,            // customer name
    email,           // customer email  
    phone,           // customer phone
    address,         // delivery address
    onSuccess,       // callback when payment verified successfully
    onFailure        // callback when payment fails
  }) => {
    setLoading(true)
    try {
      // 1. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        addToast({ message: 'Payment service unavailable. Try COD.', type: 'error' })
        if (onFailure) onFailure(new Error('Razorpay script load failed'))
        setLoading(false)
        return
      }

      // 2. Create Razorpay order on backend
      let orderData
      try {
        orderData = await createRazorpayOrder(amount)
      } catch (err) {
        addToast({ message: 'Could not initiate payment. Try again.', type: 'error' })
        if (onFailure) onFailure(err)
        setLoading(false)
        return
      }

      const { orderId, currency, key } = orderData

      // 3. Open Razorpay Checkout popup
      const options = {
        key: key,
        amount: orderData.amount, // backend returns it in paise
        currency: currency || 'INR',
        name: 'NH Salem Sea Foods',
        description: 'Fresh Seafood Delivery',
        image: '/crest.png',
        order_id: orderId,
        handler: async (response) => {
          setLoading(true)
          try {
            // Verify payment
            const verifyRes = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
            if (verifyRes.success) {
              if (onSuccess) {
                onSuccess({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                })
              }
            } else {
              addToast({ message: 'Payment verification failed. Contact support.', type: 'error' })
              if (onFailure) onFailure(new Error('Signature verification failed'))
            }
          } catch (verifyErr) {
            addToast({ message: 'Payment verification failed. Contact support.', type: 'error' })
            if (onFailure) onFailure(verifyErr)
          } finally {
            setLoading(false)
          }
        },
        prefill: {
          name: name || '',
          email: email || '',
          contact: phone || ''
        },
        notes: {
          address: address || ''
        },
        theme: {
          color: '#166534'
        },
        modal: {
          ondismiss: () => {
            addToast({ message: 'Payment cancelled. Your cart is saved.', type: 'warning' })
            if (onFailure) onFailure(new Error('Payment cancelled by user'))
            setLoading(false)
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response) {
        addToast({ message: 'Payment failed. Please try again.', type: 'error' })
        if (onFailure) onFailure(new Error(response.error.description || 'Payment failed'))
        setLoading(false)
      })
      rzp.open()
    } catch (err) {
      addToast({ message: 'Could not initiate payment. Try again.', type: 'error' })
      if (onFailure) onFailure(err)
      setLoading(false)
    }
  }

  return { initiatePayment, loading }
}
