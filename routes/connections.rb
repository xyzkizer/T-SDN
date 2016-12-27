class ConnectionController < Application

  get '/connection' do
    flash_debug "GET connection"
    slim :'conn'
  end
end
